-- Table for storing tools
CREATE TABLE tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_name VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0,
  creator_id VARCHAR(255) -- Clerk user ID who added the tool
);

-- Junction table for tools and categories
CREATE TABLE tool_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  category_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing power users of tools
CREATE TABLE tool_power_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL, -- Clerk user ID 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tools_name ON tools(name);
CREATE INDEX idx_tool_categories_tool_id ON tool_categories(tool_id);
CREATE INDEX idx_tool_categories_category_name ON tool_categories(category_name);
CREATE INDEX idx_tool_power_users_tool_id ON tool_power_users(tool_id);
CREATE INDEX idx_tool_power_users_user_id ON tool_power_users(user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update the updated_at column on each update
CREATE TRIGGER update_tools_updated_at
BEFORE UPDATE ON tools
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert initial category options (can be used for filtering)
INSERT INTO tool_categories (tool_id, category_name) 
VALUES 
  (NULL, 'Design'),
  (NULL, 'Development'),
  (NULL, 'Productivity'),
  (NULL, 'Collaboration'),
  (NULL, 'Communication'),
  (NULL, 'Project Management'),
  (NULL, 'Documentation'),
  (NULL, 'Cloud'),
  (NULL, 'Version Control'),
  (NULL, 'Issue Tracking');

-- Create tools table
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  category TEXT,
  submitted_by TEXT,
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT tools_pkey PRIMARY KEY (id),
  CONSTRAINT tools_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id)
);

-- Create indexes for tool queries
CREATE INDEX IF NOT EXISTS idx_tools_category ON public.tools USING btree (category);
CREATE INDEX IF NOT EXISTS idx_tools_votes ON public.tools USING btree (votes);

-- Create tool_votes table
CREATE TABLE IF NOT EXISTS public.tool_votes (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  tool_id UUID,
  user_id TEXT,
  vote_type INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT tool_votes_pkey PRIMARY KEY (id),
  CONSTRAINT tool_votes_tool_id_user_id_key UNIQUE (tool_id, user_id),
  CONSTRAINT tool_votes_tool_id_fkey FOREIGN KEY (tool_id) REFERENCES public.tools(id) ON DELETE CASCADE,
  CONSTRAINT tool_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Create function to update tool votes count
CREATE OR REPLACE FUNCTION public.handle_tool_vote()
RETURNS TRIGGER AS $$
BEGIN
  -- If vote is being deleted or changed to 0, decrement the count
  IF (TG_OP = 'DELETE') OR (TG_OP = 'UPDATE' AND NEW.vote_type = 0) THEN
    UPDATE public.tools
    SET votes = votes - 1
    WHERE id = COALESCE(OLD.tool_id, NEW.tool_id);

    -- If it's a delete operation, we're done
    IF (TG_OP = 'DELETE') THEN
      RETURN OLD;
    END IF;
  END IF;

  -- For insert or update operations with a non-zero vote
  IF (TG_OP = 'INSERT' AND NEW.vote_type != 0) OR 
     (TG_OP = 'UPDATE' AND OLD.vote_type = 0 AND NEW.vote_type != 0) THEN
    UPDATE public.tools
    SET votes = votes + 1
    WHERE id = NEW.tool_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to maintain vote counts
DROP TRIGGER IF EXISTS trigger_tool_vote_update ON public.tool_votes;
CREATE TRIGGER trigger_tool_vote_update
AFTER INSERT OR UPDATE OR DELETE ON public.tool_votes
FOR EACH ROW EXECUTE FUNCTION public.handle_tool_vote();
