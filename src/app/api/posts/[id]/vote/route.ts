import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch the user's current vote on a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const { userId } = await auth();

  if (!id) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ vote: null }, { status: 200 });
  }

  try {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('is_public, creator_id')
      .eq('id', id)
      .single();

    if (postError) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const canAccess = post.is_public || post.creator_id === userId;
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: vote, error } = await supabase
      .from('post_votes')
      .select('vote_type')
      .eq('post_id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json({ vote: vote?.vote_type ?? null });
  } catch (error) {
    console.error('GET /vote error:', error);
    return NextResponse.json({ error: 'Failed to fetch vote' }, { status: 500 });
  }
}

// POST: Create, update, or remove vote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
  }

  try {
    const { vote_type }: { vote_type: 1 | -1 } = await request.json();

    if (vote_type !== 1 && vote_type !== -1) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('is_public, creator_id, upvotes')
      .eq('id', id)
      .single();

    if (postError) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const canVote = post.is_public || post.creator_id === userId;
    if (!canVote) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: existingVote, error: voteError } = await supabase
      .from('post_votes')
      .select('id, vote_type')
      .eq('post_id', id)
      .eq('user_id', userId)
      .single();

    let action: 'created' | 'updated' | 'removed' = 'created';

    if (!existingVote) {
      const { error } = await supabase.from('post_votes').insert({
        post_id: id,
        user_id: userId,
        vote_type,
      });
      if (error) throw error;
    } else if (existingVote.vote_type === vote_type) {
      const { error } = await supabase
        .from('post_votes')
        .delete()
        .eq('id', existingVote.id);
      if (error) throw error;
      action = 'removed';
    } else {
      const { error } = await supabase
        .from('post_votes')
        .update({ vote_type })
        .eq('id', existingVote.id);
      if (error) throw error;
      action = 'updated';
    }

    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .select('upvotes')
      .eq('id', id)
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      action,
      upvotes: updatedPost.upvotes,
    });
  } catch (error) {
    console.error('POST /vote error:', error);
    return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 });
  }
}
