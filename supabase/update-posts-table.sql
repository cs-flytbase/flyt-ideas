-- Add creator_name and creator_avatar columns to posts table
ALTER TABLE public.posts
ADD COLUMN creator_name text NULL,
ADD COLUMN creator_avatar text NULL;
