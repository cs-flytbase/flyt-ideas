// app/api/ideas/[id]/vote/route.ts

import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch a user's vote on a specific idea
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  // Await the params object
  const { id: ideaId } = await params;

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  // If not authenticated, return null vote
  if (!userId) {
    return NextResponse.json({ vote: null }, { status: 200 });
  }

  try {
    // Get the user's vote for this idea
    const { data, error } = await supabase
      .from('idea_votes')
      .select('*')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
      throw error;
    }
    
    return NextResponse.json({ vote: data || null });
  } catch (error) {
    console.error('Error fetching vote:', error);
    return NextResponse.json({ error: 'Failed to fetch vote' }, { status: 500 });
  }
}

// POST: Create or update a vote
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  // Await the params object
  const { id: ideaId } = await params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { vote_type } = body;
    
    // Validate vote type
    if (vote_type !== 1 && vote_type !== -1) {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be 1 (upvote) or -1 (downvote)' },
        { status: 400 }
      );
    }

    // Check if the user has already voted on this idea
    const { data: existingVote, error: selectError } = await supabase
      .from('idea_votes')
      .select('*')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    let result;
    
    if (existingVote) {
      // If the vote is the same as the existing vote, delete it (toggle off)
      if (existingVote.vote_type === vote_type) {
        const { error } = await supabase
          .from('idea_votes')
          .delete()
          .eq('id', existingVote.id);
        
        if (error) throw error;
        
        result = { vote: null, action: 'removed' };
      } else {
        // If the vote is different, update it
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
      // If no existing vote, create a new one
      const { data, error } = await supabase
        .from('idea_votes')
        .insert({
          idea_id: ideaId,
          user_id: userId,
          vote_type
        })
        .select()
        .single();
      
      if (error) throw error;
      
      result = { vote: data, action: 'created' };
    }

    // Fetch the updated vote count
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('upvotes')
      .eq('id', ideaId)
      .single();
    
    if (ideaError) throw ideaError;
    
    return NextResponse.json({
      ...result,
      upvotes: idea.upvotes
    });
  } catch (error) {
    console.error('Error updating vote:', error);
    return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 });
  }
}

// DELETE: Remove a vote
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  // Await the params object
  const { id: ideaId } = await params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  try {
    // Delete the vote
    const { error } = await supabase
      .from('idea_votes')
      .delete()
      .eq('idea_id', ideaId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Fetch the updated vote count
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('upvotes')
      .eq('id', ideaId)
      .single();
    
    if (ideaError) throw ideaError;
    
    return NextResponse.json({
      action: 'removed',
      upvotes: idea.upvotes
    });
  } catch (error) {
    console.error('Error removing vote:', error);
    return NextResponse.json({ error: 'Failed to remove vote' }, { status: 500 });
  }
}
