import { supabase } from '@/lib/supabase';
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch a single post with comments in one request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;
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

    // Restrict based on authentication
    if (!userId) {
      query = query.eq('is_public', true);
    } else {
      query = query.or(`is_public.eq.true,creator_id.eq.${userId}`);
    }

    const { data: post, error: postError } = await query.single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      throw postError;
    }

    // Fetch post comments and authors
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

    // Fallback for missing author data
    const processedComments = (comments || []).map(comment => ({
      ...comment,
      author: comment.author ?? {
        id: comment.user_id,
        display_name: 'Anonymous',
        avatar_url: '',
      },
    }));

    return NextResponse.json({
      post,
      comments: processedComments,
    });
  } catch (error) {
    console.error('Error fetching post with comments:', error);
    return NextResponse.json({ error: 'Failed to fetch post data' }, { status: 500 });
  }
}
