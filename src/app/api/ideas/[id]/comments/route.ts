import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ideaId = params.id;

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  try {
    // Get all comments for this idea
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:user_id(id, display_name, avatar_url)
      `)
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ comments: data });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  const ideaId = params.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    // Add the comment
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          idea_id: ideaId,
          user_id: userId,
          content,
          created_at: new Date().toISOString()
        }
      ])
      .select(`
        *,
        user:user_id(id, display_name, avatar_url)
      `);

    if (error) {
      throw error;
    }

    return NextResponse.json({ comment: data[0] });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
