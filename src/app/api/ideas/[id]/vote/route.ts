import { supabase } from '@/lib/supabase';
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch a user's vote on a specific idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ideaId } = await params;
  const { userId } = await auth();

  if (!ideaId) return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });

  if (!userId) {
    return NextResponse.json({ vote: null }, { status: 200 });
  }

  try {
    const { data, error } = await supabase
      .from('idea_votes')
      .select('*')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json({ vote: data || null });
  } catch (error) {
    console.error('Error fetching vote:', error);
    return NextResponse.json({ error: 'Failed to fetch vote' }, { status: 500 });
  }
}

// POST: Create or update a vote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ideaId } = await params;
  const { userId } = await auth();

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!ideaId) return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });

  try {
    const { vote_type } = await request.json();

    if (![1, -1].includes(vote_type)) {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be 1 (upvote) or -1 (downvote)' },
        { status: 400 }
      );
    }

    const { data: existingVote, error: selectError } = await supabase
      .from('idea_votes')
      .select('*')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') throw selectError;

    let result;

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        const { error } = await supabase
          .from('idea_votes')
          .delete()
          .eq('id', existingVote.id);

        if (error) throw error;
        result = { vote: null, action: 'removed' };
      } else {
        const { data, error } = await supabase
          .from('idea_votes')
          .update({ vote_type })
          .eq('id', existingVote.id)
          .select()
          .single();

        if (error) throw error;
        result = { vote: data, action: 'updated' };
      }
    } else {
      const { data, error } = await supabase
        .from('idea_votes')
        .insert({
          idea_id: ideaId,
          user_id: userId,
          vote_type,
        })
        .select()
        .single();

      if (error) throw error;
      result = { vote: data, action: 'created' };
    }

    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('upvotes')
      .eq('id', ideaId)
      .single();

    if (ideaError) throw ideaError;

    return NextResponse.json({
      ...result,
      upvotes: idea.upvotes,
    });
  } catch (error) {
    console.error('Error updating vote:', error);
    return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 });
  }
}

// DELETE: Remove a vote
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ideaId } = await params;
  const { userId } = await auth();

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!ideaId) return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });

  try {
    const { error } = await supabase
      .from('idea_votes')
      .delete()
      .eq('idea_id', ideaId)
      .eq('user_id', userId);

    if (error) throw error;

    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('upvotes')
      .eq('id', ideaId)
      .single();

    if (ideaError) throw ideaError;

    return NextResponse.json({
      action: 'removed',
      upvotes: idea.upvotes,
    });
  } catch (error) {
    console.error('Error removing vote:', error);
    return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 });
  }
}
