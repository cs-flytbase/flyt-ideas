-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (mapped to Clerk users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,  -- This will store the Clerk userId
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id),
  is_public BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft', -- 'draft', 'in_progress', 'completed', 'archived'
  upvotes INTEGER DEFAULT 0,
  tags TEXT[], -- Store tags as an array
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ideas_creator ON ideas(creator_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_public ON ideas(is_public);

-- Idea collaborators junction table
CREATE TABLE IF NOT EXISTS idea_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  role TEXT DEFAULT 'viewer', -- 'viewer', 'editor', 'admin'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(idea_id, user_id)
);

-- Create indexes for collaborator lookups
CREATE INDEX IF NOT EXISTS idx_collaborators_user ON idea_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_idea ON idea_collaborators(idea_id);

-- Checklists for ideas (both shared and personal)
CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_shared BOOLEAN DEFAULT FALSE, -- false=personal, true=shared with collaborators
  creator_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for checklist lookups
CREATE INDEX IF NOT EXISTS idx_checklists_idea ON checklists(idea_id);
CREATE INDEX IF NOT EXISTS idx_checklists_creator ON checklists(creator_id);
CREATE INDEX IF NOT EXISTS idx_checklists_shared ON checklists(is_shared);

-- Checklist items
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID REFERENCES checklists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  position INTEGER NOT NULL, -- For ordering items within a checklist
  completed BOOLEAN DEFAULT FALSE,
  completed_by UUID REFERENCES users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES users(id), -- Optional assignment to a specific person
  due_date TIMESTAMP WITH TIME ZONE, -- Optional due date
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Create indexes for checklist item lookups
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist ON checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_assigned ON checklist_items(assigned_to);
CREATE INDEX IF NOT EXISTS idx_checklist_items_completed ON checklist_items(completed);

-- Comments on ideas (for threaded discussions)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id), -- Self-reference for threaded replies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for comment lookups
CREATE INDEX IF NOT EXISTS idx_comments_idea ON comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- Activity log to track who did what
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  idea_id UUID REFERENCES ideas(id) ON DELETE CASCADE,
  checklist_id UUID REFERENCES checklists(id),
  item_id UUID REFERENCES checklist_items(id),
  action_type TEXT NOT NULL, -- 'created_idea', 'updated_idea', 'completed_item', etc.
  details JSONB, -- Additional context about the action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for activity lookups
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_idea ON activity_log(idea_id);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at);

-- Tools directory
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  url TEXT,
  category TEXT,
  submitted_by UUID REFERENCES users(id),
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for tool lookups
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_votes ON tools(votes);

-- User tool votes
CREATE TABLE IF NOT EXISTS tool_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  vote_type INTEGER NOT NULL, -- 1 for upvote, -1 for downvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tool_id, user_id)
);

-- Create trigger functions for various actions

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

-- Row Level Security Policies

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_votes ENABLE ROW LEVEL SECURITY;

-- USER POLICIES
-- Everyone can view user profiles
CREATE POLICY "Anyone can view user profiles" ON users
  FOR SELECT USING (true);

-- IDEAS POLICIES
-- 1. Public ideas can be viewed by anyone
CREATE POLICY "Public ideas are viewable by everyone" ON ideas
  FOR SELECT USING (is_public = true);

-- 2. Users can view their own private ideas
CREATE POLICY "Users can view their own private ideas" ON ideas
  FOR SELECT USING (auth.uid() = creator_id);

-- 3. Collaborators can view ideas they are collaborating on
CREATE POLICY "Collaborators can view ideas" ON ideas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM idea_collaborators
      WHERE idea_collaborators.idea_id = id
      AND idea_collaborators.user_id = auth.uid()
    )
  );

-- 4. Creators can update their own ideas
CREATE POLICY "Creators can update their ideas" ON ideas
  FOR UPDATE USING (auth.uid() = creator_id);

-- 5. Creators can delete their own ideas
CREATE POLICY "Creators can delete their ideas" ON ideas
  FOR DELETE USING (auth.uid() = creator_id);

-- 6. Authenticated users can create ideas
CREATE POLICY "Authenticated users can create ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- IDEA COLLABORATORS POLICIES
-- 1. Users can see collaborators for public ideas or their own ideas
CREATE POLICY "Users can see collaborators for public ideas or their own" ON idea_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = idea_id
      AND (ideas.is_public = true OR ideas.creator_id = auth.uid())
    )
  );

-- 2. Users can see collaborators for ideas they collaborate on
CREATE POLICY "Collaborators can see other collaborators" ON idea_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM idea_collaborators ic
      WHERE ic.idea_id = idea_id
      AND ic.user_id = auth.uid()
    )
  );

-- CHECKLISTS POLICIES
-- 1. Users can view their own checklists
CREATE POLICY "Users can view their own checklists" ON checklists
  FOR SELECT USING (creator_id = auth.uid());

-- 2. Users can view shared checklists for ideas they collaborate on
CREATE POLICY "Users can view shared checklists for collaborative ideas" ON checklists
  FOR SELECT USING (
    is_shared = true AND
    EXISTS (
      SELECT 1 FROM idea_collaborators
      WHERE idea_collaborators.idea_id = checklists.idea_id
      AND idea_collaborators.user_id = auth.uid()
    )
  );

-- 3. Users can create checklists for their ideas or ideas they collaborate on
CREATE POLICY "Users can create checklists" ON checklists
  FOR INSERT WITH CHECK (
    creator_id = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM ideas
        WHERE ideas.id = idea_id
        AND ideas.creator_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM idea_collaborators
        WHERE idea_collaborators.idea_id = checklists.idea_id
        AND idea_collaborators.user_id = auth.uid()
      )
    )
  );

-- CHECKLIST ITEMS POLICIES
-- 1. Users can view items in their own checklists
CREATE POLICY "Users can view items in their own checklists" ON checklist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM checklists
      WHERE checklists.id = checklist_id
      AND checklists.creator_id = auth.uid()
    )
  );

-- 2. Users can view items in shared checklists for ideas they collaborate on
CREATE POLICY "Users can view items in shared checklists" ON checklist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM checklists
      JOIN idea_collaborators ON checklists.idea_id = idea_collaborators.idea_id
      WHERE checklists.id = checklist_id
      AND checklists.is_shared = true
      AND idea_collaborators.user_id = auth.uid()
    )
  );

-- COMMENTS POLICIES
-- 1. Users can view comments on ideas they can view
CREATE POLICY "Users can view comments on ideas they can view" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = comments.idea_id
      AND (
        ideas.is_public = true OR
        ideas.creator_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM idea_collaborators
          WHERE idea_collaborators.idea_id = ideas.id
          AND idea_collaborators.user_id = auth.uid()
        )
      )
    )
  );

-- 2. Users can create comments on ideas they can view
CREATE POLICY "Users can create comments on ideas they can view" ON comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = comments.idea_id
      AND (
        ideas.is_public = true OR
        ideas.creator_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM idea_collaborators
          WHERE idea_collaborators.idea_id = ideas.id
          AND idea_collaborators.user_id = auth.uid()
        )
      )
    )
  );

-- TOOLS POLICIES
-- Everyone can view tools
CREATE POLICY "Anyone can view tools" ON tools
  FOR SELECT USING (true);

-- Authenticated users can create tools
CREATE POLICY "Authenticated users can create tools" ON tools
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

-- TOOL VOTES POLICIES
-- 1. Users can view votes on tools
CREATE POLICY "Users can view votes on tools" ON tool_votes
  FOR SELECT USING (true);

-- 2. Users can create votes on tools
CREATE POLICY "Users can create votes on tools" ON tool_votes
  FOR INSERT WITH CHECK (user_id = auth.uid());
