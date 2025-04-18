-- Create idea_assignments table
CREATE TABLE IF NOT EXISTS idea_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(idea_id, user_id)
);

-- Add RLS policies for idea_assignments
ALTER TABLE idea_assignments ENABLE ROW LEVEL SECURITY;

-- Policy for viewing assignments (anyone can view assignments for published ideas)
CREATE POLICY "Anyone can view assignments for published ideas" ON idea_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.id = idea_assignments.idea_id
      AND ideas.is_published = true
    )
  );

-- Policy for inserting assignments (authenticated users can assign themselves to ideas)
CREATE POLICY "Users can assign themselves to ideas" ON idea_assignments
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy for deleting assignments (users can only remove their own assignments)
CREATE POLICY "Users can delete their own assignments" ON idea_assignments
  FOR DELETE
  USING (auth.uid()::text = user_id);
