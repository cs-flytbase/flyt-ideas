  -- Create posts table
  CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    creator_id TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create RLS policies for posts
  ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

  -- Anyone can read public posts
  CREATE POLICY "Public posts are viewable by everyone"
    ON posts
    FOR SELECT
    USING (is_public = true);

  -- Users can read all posts they've created
  CREATE POLICY "Users can view their own posts"
    ON posts
    FOR SELECT
    USING (creator_id = auth.uid()::text);

  -- Users can insert their own posts
  CREATE POLICY "Users can create their own posts"
    ON posts
    FOR INSERT
    WITH CHECK (creator_id = auth.uid()::text);

  -- Users can update their own posts
  CREATE POLICY "Users can update their own posts"
    ON posts
    FOR UPDATE
    USING (creator_id = auth.uid()::text);

  -- Users can delete their own posts
  CREATE POLICY "Users can delete their own posts"
    ON posts
    FOR DELETE
    USING (creator_id = auth.uid()::text);

  -- Create post_comments table
  CREATE TABLE IF NOT EXISTS post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Create RLS policies for post_comments
  ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

  -- Anyone can read comments on public posts
  CREATE POLICY "Comments on public posts are viewable by everyone"
    ON post_comments
    FOR SELECT
    USING ((SELECT is_public FROM posts WHERE id = post_id::uuid) = true);

  -- Users can read comments on their own posts
  CREATE POLICY "Users can view comments on their own posts"
    ON post_comments
    FOR SELECT
    USING ((SELECT creator_id FROM posts WHERE id = post_id::uuid) = auth.uid()::text);

  -- Users can insert comments
  CREATE POLICY "Users can create comments"
    ON post_comments
    FOR INSERT
    WITH CHECK (user_id = auth.uid()::text);

  -- Users can update their own comments
  CREATE POLICY "Users can update their own comments"
    ON post_comments
    FOR UPDATE
    USING (user_id = auth.uid()::text);

  -- Users can delete their own comments
  CREATE POLICY "Users can delete their own comments"
    ON post_comments
    FOR DELETE
    USING (user_id = auth.uid()::text);

  -- Create post_votes table
  CREATE TABLE IF NOT EXISTS post_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    vote_type INTEGER NOT NULL CHECK (vote_type IN (1, -1)), -- 1 for upvote, -1 for downvote
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
  );

  -- Create RLS policies for post_votes
  ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;

  -- Users can view post votes on public posts
  CREATE POLICY "Users can see votes on public posts"
    ON post_votes
    FOR SELECT
    USING ((SELECT is_public FROM posts WHERE id = post_id::uuid) = true);

  -- Users can view post votes on their own posts
  CREATE POLICY "Users can see votes on their own posts"
    ON post_votes
    FOR SELECT
    USING ((SELECT creator_id FROM posts WHERE id = post_id::uuid) = auth.uid()::text);

  -- Users can vote on posts
  CREATE POLICY "Users can vote on posts"
    ON post_votes
    FOR INSERT
    WITH CHECK (user_id = auth.uid()::text);

  -- Users can update their own votes
  CREATE POLICY "Users can update their own votes"
    ON post_votes
    FOR UPDATE
    USING (user_id = auth.uid()::text);

  -- Users can delete their own votes
  CREATE POLICY "Users can delete their own votes"
    ON post_votes
    FOR DELETE
    USING (user_id = auth.uid()::text);

  -- Create trigger to update post upvotes count
  CREATE OR REPLACE FUNCTION update_post_votes()
  RETURNS TRIGGER AS $$
  BEGIN
    IF TG_OP = 'INSERT' THEN
      -- Update the post's upvote count
      UPDATE posts
      SET upvotes = upvotes + NEW.vote_type
      WHERE id = NEW.post_id::uuid;
    ELSIF TG_OP = 'UPDATE' AND OLD.vote_type <> NEW.vote_type THEN
      -- If vote changed from upvote to downvote or vice versa, update by the difference
      UPDATE posts
      SET upvotes = upvotes + (NEW.vote_type - OLD.vote_type)
      WHERE id = NEW.post_id::uuid;
    ELSIF TG_OP = 'DELETE' THEN
      -- If a vote is removed, subtract its value from the post's upvote count
      UPDATE posts
      SET upvotes = upvotes - OLD.vote_type
      WHERE id = OLD.post_id::uuid;
    END IF;
    RETURN NULL;
  END;
  $$ LANGUAGE plpgsql;

  -- Create triggers for post votes
  CREATE TRIGGER on_post_vote_added
  AFTER INSERT ON post_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_votes();

  CREATE TRIGGER on_post_vote_updated
  AFTER UPDATE ON post_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_votes();

  CREATE TRIGGER on_post_vote_deleted
  AFTER DELETE ON post_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_votes();
