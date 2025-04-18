import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id: requestId } = await params;

  const session = await auth();
  const userId = session?.userId;

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    // Check if the feature request exists
    const { data: featureRequest, error: featureRequestError } = await supabase
      .from('feature_requests')
      .select('id, upvotes, title, creator_id')
      .eq('id', requestId)
      .single();

    if (featureRequestError || !featureRequest) {
      return NextResponse.json({ error: 'Feature request not found' }, { status: 404 });
    }

    // Confirm user profile exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check for existing upvote
    const { data: existingUpvote } = await supabase
      .from('upvotes')
      .select('id')
      .eq('feature_request_id', requestId)
      .eq('user_id', userId)
      .single();

    if (existingUpvote) {
      return NextResponse.json(
        { error: 'You have already upvoted this feature request' },
        { status: 400 }
      );
    }

    // Add upvote entry
    const { error: upvoteInsertError } = await supabase
      .from('upvotes')
      .insert({
        feature_request_id: requestId,
        user_id: userId,
      });

    if (upvoteInsertError) {
      console.error('Error adding upvote:', upvoteInsertError);
      return NextResponse.json({ error: 'Failed to register upvote' }, { status: 500 });
    }

    // Update upvote count
    const { data: updatedRequest, error: updateError } = await supabase
      .from('feature_requests')
      .update({ upvotes: (featureRequest.upvotes || 0) + 1 })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating upvote count:', updateError);
      return NextResponse.json({ error: 'Failed to update upvote count' }, { status: 500 });
    }

    // Optional: notify the creator
    if (featureRequest.creator_id && featureRequest.creator_id !== userId) {
      await supabase.from('notifications').insert({
        type: 'upvote',
        title: 'Your feature request got an upvote!',
        content: `Someone upvoted your feature request "${featureRequest.title}".`,
        recipient_id: featureRequest.creator_id,
        sender_id: userId,
        source_url: `/feature-requests/${requestId}`,
        is_read: false,
      });
    }

    return NextResponse.json({
      success: true,
      upvotes: updatedRequest.upvotes,
    });
  } catch (error) {
    console.error('Error processing upvote:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing the upvote' },
      { status: 500 }
    );
  }
}
