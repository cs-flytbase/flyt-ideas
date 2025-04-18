-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (mapped to Clerk users)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,  -- This will store the Clerk userId as text
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Ideas table
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  creator_id TEXT REFERENCES public.users(id),
  status TEXT DEFAULT 'draft', -- 'draft', 'in_progress', 'completed', 'archived'
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  upvotes INTEGER DEFAULT 0,
  tags TEXT[], -- Store tags as an array
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ideas_creator ON ideas(creator_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_published ON ideas(is_published);

-- Idea collaborators junction table
CREATE TABLE IF NOT EXISTS public.idea_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id),
  role TEXT DEFAULT 'viewer', -- 'viewer', 'editor', 'admin'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(idea_id, user_id)
);

-- Create indexes for collaborator lookups
CREATE INDEX IF NOT EXISTS idx_collaborators_user ON idea_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_idea ON idea_collaborators(idea_id);

-- Checklists for ideas (both shared and personal)
CREATE TABLE IF NOT EXISTS public.checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_shared BOOLEAN DEFAULT FALSE, -- false=personal, true=shared with collaborators
  creator_id TEXT REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for checklist lookups
CREATE INDEX IF NOT EXISTS idx_checklists_idea ON checklists(idea_id);
CREATE INDEX IF NOT EXISTS idx_checklists_creator ON checklists(creator_id);
CREATE INDEX IF NOT EXISTS idx_checklists_shared ON checklists(is_shared);

-- Checklist items
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID REFERENCES public.checklists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  position INTEGER NOT NULL, -- For ordering items within a checklist
  completed BOOLEAN DEFAULT FALSE,
  completed_by TEXT REFERENCES public.users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to TEXT REFERENCES public.users(id), -- Optional assignment to a specific person
  due_date TIMESTAMP WITH TIME ZONE, -- Optional due date
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT REFERENCES public.users(id)
);

-- Create indexes for checklist item lookups
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_assigned ON checklist_items(assigned_to);
CREATE INDEX IF NOT EXISTS idx_checklist_items_completed ON checklist_items(completed);

-- Comments on ideas (for threaded discussions)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id), -- Self-reference for threaded replies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for comment lookups
CREATE INDEX IF NOT EXISTS idx_comments_idea ON comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- Activity log to track who did what
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES public.users(id),
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
  checklist_id UUID REFERENCES public.checklists(id),
  item_id UUID REFERENCES public.checklist_items(id),
  action_type TEXT NOT NULL, -- 'created_idea', 'updated_idea', 'completed_item', etc.
  details JSONB, -- Additional context about the action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for activity lookups
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_idea ON activity_log(idea_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at);

-- Posts table (for general posts by users)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  creator_id TEXT REFERENCES public.users(id),
  upvotes INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_creator ON posts(creator_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);

-- Tools directory
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  category TEXT,
  submitted_by TEXT REFERENCES public.users(id),
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for tool lookups
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_votes ON tools(votes);

-- User tool votes
CREATE TABLE IF NOT EXISTS public.tool_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES public.tools(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id),
  vote_type INTEGER NOT NULL, -- 1 for upvote, -1 for downvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update timestamps
CREATE TRIGGER update_ideas_updated_at
BEFORE UPDATE ON ideas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklists_updated_at
BEFORE UPDATE ON checklists
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to log activity when an item is checked off
CREATE OR REPLACE FUNCTION log_item_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
    INSERT INTO activity_log (user_id, idea_id, checklist_id, item_id, action_type, details)
    SELECT 
      NEW.completed_by,
      c.idea_id,
      NEW.checklist_id,
      NEW.id,
      'completed_item',
      jsonb_build_object('item_text', NEW.text)
    FROM checklists c
    WHERE c.id = NEW.checklist_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log when items are completed
CREATE TRIGGER log_checklist_item_completion
AFTER UPDATE OF completed ON checklist_items
FOR EACH ROW
EXECUTE FUNCTION log_item_completion();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
-- Allow authenticated users to select all users
CREATE POLICY "Allow all users to view profiles"
  ON public.users FOR SELECT
  USING (true);

-- Ideas policies
CREATE POLICY "Anyone can view published ideas"
  ON public.ideas FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can view their own unpublished ideas"
  ON public.ideas FOR SELECT
  USING (auth.uid()::text = creator_id::text);

CREATE POLICY "Users can view ideas they collaborate on"
  ON public.ideas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM idea_collaborators
      WHERE idea_collaborators.idea_id = id
      AND idea_collaborators.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can create their own ideas"
  ON public.ideas FOR INSERT
  WITH CHECK (auth.uid()::text = creator_id::text);

CREATE POLICY "Users can update their own ideas"
  ON public.ideas FOR UPDATE
  USING (auth.uid()::text = creator_id::text);

-- Posts policies
CREATE POLICY "Anyone can view posts"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid()::text = creator_id::text);

CREATE POLICY "Users can update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid()::text = creator_id::text);

-- Create helper function for syncing users from Clerk and tracking online status
CREATE OR REPLACE FUNCTION sync_user_from_clerk() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar_url, last_active, is_online, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email_addresses[1]->>'email_address',
    NEW.first_name || ' ' || NEW.last_name,
    NEW.image_url,
    NOW(),
    TRUE,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    last_active = NOW(),
    is_online = TRUE,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update the user's online status
CREATE OR REPLACE FUNCTION update_user_online_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET is_online = TRUE,
      last_active = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
