-- Create idea_votes table
CREATE TABLE IF NOT EXISTS idea_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)), -- 1 for upvote, -1 for downvote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(idea_id, user_id)
);

-- Add RLS policies for idea_votes
ALTER TABLE idea_votes ENABLE ROW LEVEL SECURITY;

-- Policy for viewing votes (anyone can view votes)
CREATE POLICY "Anyone can view votes" ON idea_votes
  FOR SELECT
  USING (true);

-- Policy for inserting votes (authenticated users can vote)
CREATE POLICY "Users can vote on ideas" ON idea_votes
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy for updating votes (users can update their own votes)
CREATE POLICY "Users can update their own votes" ON idea_votes
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Policy for deleting votes (users can remove their own votes)
CREATE POLICY "Users can remove their own votes" ON idea_votes
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Create function to update idea upvotes count when votes change
CREATE OR REPLACE FUNCTION update_idea_votes()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate the total score for the idea
  UPDATE ideas
  SET upvotes = (
    SELECT COALESCE(SUM(vote_type), 0)
    FROM idea_votes
    WHERE idea_id = COALESCE(NEW.idea_id, OLD.idea_id)
  )
  WHERE id = COALESCE(NEW.idea_id, OLD.idea_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to update idea upvotes count
CREATE TRIGGER update_idea_votes_on_insert
AFTER INSERT ON idea_votes
FOR EACH ROW
EXECUTE FUNCTION update_idea_votes();

CREATE TRIGGER update_idea_votes_on_update
AFTER UPDATE ON idea_votes
FOR EACH ROW
EXECUTE FUNCTION update_idea_votes();

CREATE TRIGGER update_idea_votes_on_delete
AFTER DELETE ON idea_votes
FOR EACH ROW
EXECUTE FUNCTION update_idea_votes();
