import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch a single post with comments in one request
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

    // Get post data
    let query = supabase
      .from('posts')
      .select(`
        *,
        creator:creator_id(id, display_name, avatar_url)
      `)
      .eq('id', id);

    // If user is not logged in, only allow viewing public posts
    if (!userId) {
      query = query.eq('is_public', true);
    } else {
      // If user is logged in, they can view their own posts or public posts
      query = query.or(`is_public.eq.true,creator_id.eq.${userId}`);
    }

    const { data: post, error: postError } = await query.single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      throw postError;
    }

    // Get comments for this post with authors in a single query (efficient)
    const { data: comments, error: commentsError } = await supabase
      .from('post_comments')
      .select(`
        *,
        author:user_id(id, display_name, avatar_url)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (commentsError) {
      throw commentsError;
    }

    // Process comments - ensure every comment has author info
    const processedComments = comments.map(comment => {
      if (!comment.author) {
        return {
          ...comment,
          author: {
            id: comment.user_id,
            display_name: 'Anonymous',
            avatar_url: ''
          }
        };
      }
      return comment;
    });

    // Return both post and comments in a single response
    return NextResponse.json({
      post,
      comments: processedComments
    });
  } catch (error) {
    console.error('Error fetching post with comments:', error);
    return NextResponse.json({ error: 'Failed to fetch post data' }, { status: 500 });
  }
}
