import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET: Get the user's current vote for a post
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Await the params object
    const { id } = await context.params;
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if post exists and is accessible to the user
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

    // Only allow accessing vote if post is public or user is creator
    const canAccess = post.is_public || post.creator_id === userId;
    
    if (!canAccess) {
      return NextResponse.json({ error: 'Cannot access this post' }, { status: 403 });
    }

    // Get the user's current vote
    const { data: vote, error } = await supabase
      .from('post_votes')
      .select('vote_type')
      .eq('post_id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Error fetching vote:', error);
    return NextResponse.json({ error: 'Failed to fetch vote' }, { status: 500 });
  }
}

// POST: Vote on a post (upvote, downvote, or remove vote)
export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Await the params object
    const { id } = await context.params;
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const { vote_type } = await request.json();

    if (vote_type !== 1 && vote_type !== -1) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    // Check if post exists and is accessible to the user
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('is_public, creator_id, upvotes')
      .eq('id', id)
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      throw postError;
    }

    // Only allow voting if post is public or user is creator
    const canVote = post.is_public || post.creator_id === userId;
    
    if (!canVote) {
      return NextResponse.json({ error: 'Cannot vote on this post' }, { status: 403 });
    }

    // Check if user has already voted
    const { data: existingVote, error: voteError } = await supabase
      .from('post_votes')
      .select('vote_type')
      .eq('post_id', id)
      .eq('user_id', userId)
      .single();

    let action = 'created';
    let updatedUpvotes = post.upvotes;

    // If there's no existing vote, create it
    if (voteError && voteError.code === 'PGRST116') {
      const { error: insertError } = await supabase
        .from('post_votes')
        .insert([
          {
            post_id: id,
            user_id: userId,
            vote_type
          }
        ]);

      if (insertError) {
        throw insertError;
      }
      
      updatedUpvotes = post.upvotes + vote_type;
    }
    // If vote exists but is different, update it
    else if (!voteError && existingVote.vote_type !== vote_type) {
      const { error: updateError } = await supabase
        .from('post_votes')
        .update({ vote_type })
        .eq('post_id', id)
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }
      
      action = 'updated';
      updatedUpvotes = post.upvotes - existingVote.vote_type + vote_type;
    }
    // If vote is the same, remove it
    else if (!voteError && existingVote.vote_type === vote_type) {
      const { error: deleteError } = await supabase
        .from('post_votes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', userId);

      if (deleteError) {
        throw deleteError;
      }
      
      action = 'removed';
      updatedUpvotes = post.upvotes - vote_type;
    }

    // Fetch the updated vote count to ensure accuracy
    const { data: updatedPost, error: updatedPostError } = await supabase
      .from('posts')
      .select('upvotes')
      .eq('id', id)
      .single();

    if (updatedPostError) {
      throw updatedPostError;
    }

    return NextResponse.json({
      action,
      upvotes: updatedPost.upvotes
    });
  } catch (error) {
    console.error('Error voting on post:', error);
    return NextResponse.json({ error: 'Failed to vote on post' }, { status: 500 });
  }
}
