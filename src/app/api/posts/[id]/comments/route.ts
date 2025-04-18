import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch comments for a post
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const session = await auth();
    const userId = session?.userId;

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if the post is accessible to the user
    let postQuery = supabase
      .from('posts')
      .select('is_public, creator_id')
      .eq('id', id)
      .single();

    const { data: post, error: postError } = await postQuery;

    if (postError) {
      if (postError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      throw postError;
    }

    // Check if user can view this post's comments
    const canView = post.is_public || (userId && post.creator_id === userId);
    
    if (!canView) {
      return NextResponse.json({ error: 'Unauthorized to view these comments' }, { status: 403 });
    }

    // Fetch comments with user information
    const { data: comments, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        user:user_id(display_name, avatar_url)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST: Add a comment to a post
export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    // Check if the post exists and is accessible
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('is_public, creator_id')
      .eq('id', id)
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      throw postError;
    }

    const canComment = post.is_public || post.creator_id === userId;
    
    if (!canComment) {
      return NextResponse.json({ error: 'You cannot comment on this post' }, { status: 403 });
    }

    // Add the comment
    const { data, error } = await supabase
      .from('post_comments')
      .insert([
        {
          post_id: id,
          user_id: userId,
          content
        }
      ])
      .select(`
        *,
        user:user_id(display_name, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
