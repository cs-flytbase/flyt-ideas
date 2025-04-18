-- Feature Requests Tables
-- This SQL script creates tables for feature requests functionality

-- Feature Requests Table
CREATE TABLE feature_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  creator_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'in_progress', 'completed', 'rejected')) DEFAULT 'active',
  category TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Feature Request Comments Table
CREATE TABLE feature_request_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feature_request_id UUID NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Feature Request Tags Table
CREATE TABLE feature_request_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE
);

-- Junction table for feature requests and tags (many-to-many)
CREATE TABLE feature_request_to_tags (
  feature_request_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES feature_request_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (feature_request_id, tag_id)
);

-- Feature Request Upvotes Table (to track which users have upvoted which requests)
CREATE TABLE feature_request_upvotes (
  feature_request_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (feature_request_id, user_id)
);

-- Notifications Table (for feature request related notifications)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('comment', 'mention', 'upvote', 'status_change')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  sender_id TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  related_feature_request_id UUID REFERENCES feature_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Row Level Security Policies

-- Feature Requests RLS
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

-- Everyone can see public feature requests
CREATE POLICY "Public feature requests are viewable by everyone" 
  ON feature_requests 
  FOR SELECT 
  USING (is_public = true);

-- Only creators can see their own private feature requests
CREATE POLICY "Creators can view their own private feature requests" 
  ON feature_requests 
  FOR SELECT 
  USING (auth.uid()::text = creator_id AND is_public = false);

-- Creators can update their own feature requests
CREATE POLICY "Creators can update their own feature requests" 
  ON feature_requests 
  FOR UPDATE 
  USING (auth.uid()::text = creator_id);

-- Authenticated users can create feature requests
CREATE POLICY "Authenticated users can create feature requests" 
  ON feature_requests 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Only creators can delete their own feature requests
CREATE POLICY "Creators can delete their own feature requests" 
  ON feature_requests 
  FOR DELETE 
  USING (auth.uid()::text = creator_id);

-- Feature Request Comments RLS
ALTER TABLE feature_request_comments ENABLE ROW LEVEL SECURITY;

-- Comments on public feature requests are viewable by everyone
CREATE POLICY "Comments on public feature requests are viewable by everyone" 
  ON feature_request_comments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM feature_requests 
    WHERE feature_requests.id = feature_request_comments.feature_request_id 
    AND feature_requests.is_public = true
  ));

-- Comments on private feature requests are only viewable by the request creator
CREATE POLICY "Comments on private feature requests are only viewable by the request creator" 
  ON feature_request_comments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM feature_requests 
    WHERE feature_requests.id = feature_request_comments.feature_request_id 
    AND feature_requests.is_public = false
    AND feature_requests.creator_id = auth.uid()::text
  ));

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" 
  ON feature_request_comments 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Comment creators can update their own comments
CREATE POLICY "Comment creators can update their own comments" 
  ON feature_request_comments 
  FOR UPDATE 
  USING (auth.uid()::text = user_id);

-- Comment creators can delete their own comments
CREATE POLICY "Comment creators can delete their own comments" 
  ON feature_request_comments 
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- Feature Request Upvotes RLS
ALTER TABLE feature_request_upvotes ENABLE ROW LEVEL SECURITY;

-- Everyone can see upvotes
CREATE POLICY "Upvotes are viewable by everyone" 
  ON feature_request_upvotes 
  FOR SELECT 
  USING (true);

-- Authenticated users can upvote
CREATE POLICY "Authenticated users can upvote" 
  ON feature_request_upvotes 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Users can remove their own upvotes
CREATE POLICY "Users can remove their own upvotes" 
  ON feature_request_upvotes 
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- Notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can only view their own notifications" 
  ON notifications 
  FOR SELECT 
  USING (auth.uid()::text = recipient_id);

-- System can create notifications (public)
CREATE POLICY "System can create notifications" 
  ON notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Users can mark their own notifications as read
CREATE POLICY "Users can mark their own notifications as read" 
  ON notifications 
  FOR UPDATE 
  USING (auth.uid()::text = recipient_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" 
  ON notifications 
  FOR DELETE 
  USING (auth.uid()::text = recipient_id);

-- Create indexes for performance
CREATE INDEX feature_requests_creator_id_idx ON feature_requests (creator_id);
CREATE INDEX feature_requests_status_idx ON feature_requests (status);
CREATE INDEX feature_request_comments_feature_request_id_idx ON feature_request_comments (feature_request_id);
CREATE INDEX feature_request_comments_user_id_idx ON feature_request_comments (user_id);
CREATE INDEX notifications_recipient_id_idx ON notifications (recipient_id);
CREATE INDEX notifications_is_read_idx ON notifications (is_read);

-- Functions and Triggers

-- Function to update feature_requests updated_at on modification
CREATE OR REPLACE FUNCTION update_feature_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before any update on feature_requests
CREATE TRIGGER trigger_update_feature_request_updated_at
BEFORE UPDATE ON feature_requests
FOR EACH ROW
EXECUTE FUNCTION update_feature_request_updated_at();

-- Function to update feature_request_comments updated_at on modification
CREATE OR REPLACE FUNCTION update_feature_request_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before any update on feature_request_comments
CREATE TRIGGER trigger_update_feature_request_comment_updated_at
BEFORE UPDATE ON feature_request_comments
FOR EACH ROW
EXECUTE FUNCTION update_feature_request_comment_updated_at();

-- Function to increment upvote count when a new upvote is added
CREATE OR REPLACE FUNCTION increment_feature_request_upvote()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feature_requests
  SET upvotes = upvotes + 1
  WHERE id = NEW.feature_request_id;
  
  -- Create a notification for the feature request creator
  INSERT INTO notifications (
    type, 
    title, 
    content, 
    source_url, 
    recipient_id, 
    sender_id, 
    related_feature_request_id
  )
  SELECT 
    'upvote',
    'Your feature request received an upvote',
    'Your feature request "' || fr.title || '" received a new upvote',
    '/feature-requests/' || fr.id,
    fr.creator_id,
    NEW.user_id,
    fr.id
  FROM feature_requests fr
  WHERE fr.id = NEW.feature_request_id
  AND fr.creator_id != NEW.user_id; -- Don't notify if user upvotes their own request
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function after any insert on feature_request_upvotes
CREATE TRIGGER trigger_increment_feature_request_upvote
AFTER INSERT ON feature_request_upvotes
FOR EACH ROW
EXECUTE FUNCTION increment_feature_request_upvote();

-- Function to decrement upvote count when an upvote is removed
CREATE OR REPLACE FUNCTION decrement_feature_request_upvote()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feature_requests
  SET upvotes = upvotes - 1
  WHERE id = OLD.feature_request_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function after any delete on feature_request_upvotes
CREATE TRIGGER trigger_decrement_feature_request_upvote
AFTER DELETE ON feature_request_upvotes
FOR EACH ROW
EXECUTE FUNCTION decrement_feature_request_upvote();

-- Function to create notification when a new comment is added
CREATE OR REPLACE FUNCTION notify_feature_request_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a notification for the feature request creator
  INSERT INTO notifications (
    type, 
    title, 
    content, 
    source_url, 
    recipient_id, 
    sender_id, 
    related_feature_request_id
  )
  SELECT 
    'comment',
    'New comment on your feature request',
    'New comment on your feature request "' || fr.title || '": "' || substring(NEW.content from 1 for 50) || 
    CASE WHEN length(NEW.content) > 50 THEN '...' ELSE '' END || '"',
    '/feature-requests/' || fr.id,
    fr.creator_id,
    NEW.user_id,
    fr.id
  FROM feature_requests fr
  WHERE fr.id = NEW.feature_request_id
  AND fr.creator_id != NEW.user_id; -- Don't notify if user comments on their own request
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function after any insert on feature_request_comments
CREATE TRIGGER trigger_notify_feature_request_comment
AFTER INSERT ON feature_request_comments
FOR EACH ROW
EXECUTE FUNCTION notify_feature_request_comment();
