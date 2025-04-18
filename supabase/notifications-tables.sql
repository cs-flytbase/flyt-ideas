-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  type TEXT NOT NULL, -- 'comment', 'mention', 'upvote', 'assignment', 'help_request'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  recipient_id TEXT NOT NULL,
  sender_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id),
  CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id)
);

-- Create index for querying user notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications USING btree (recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications USING btree (created_at);

-- Create API for reading notifications
CREATE OR REPLACE FUNCTION public.mark_notification_read(notification_id UUID, user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  notification_exists BOOLEAN;
BEGIN
  -- Check if the notification exists and belongs to the user
  SELECT EXISTS(
    SELECT 1 FROM public.notifications 
    WHERE id = notification_id AND recipient_id = user_id
  ) INTO notification_exists;
  
  -- If notification exists, mark it as read
  IF notification_exists THEN
    UPDATE public.notifications
    SET is_read = TRUE
    WHERE id = notification_id;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create API for marking all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = TRUE
  WHERE recipient_id = user_id AND is_read = FALSE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
