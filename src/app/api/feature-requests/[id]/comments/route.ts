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
    const { content } = await request.json();

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    // Verify feature request exists
    const { data: featureRequest, error: featureRequestError } = await supabase
      .from('feature_requests')
      .select('id')
      .eq('id', requestId)
      .single();

    if (featureRequestError || !featureRequest) {
      return NextResponse.json({ error: 'Feature request not found' }, { status: 404 });
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Insert new comment
    const { data: comment, error: commentError } = await supabase
      .from('feature_request_comments')
      .insert({
        feature_request_id: requestId,
        content: content.trim(),
        user_id: userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json(
        { error: 'Failed to create comment: ' + commentError.message },
        { status: 500 }
      );
    }

    // Return formatted comment response
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      user: {
        id: userData.id,
        name: userData.display_name || 'Unknown User',
        avatarUrl: userData.avatar_url || '',
      },
    };

    return NextResponse.json(formattedComment, { status: 201 });
  } catch (error) {
    console.error('Error processing comment:', error);
    return NextResponse.json(
      {
        error:
          'An error occurred while processing the comment' +
          (error instanceof Error ? `: ${error.message}` : ''),
      },
      { status: 500 }
    );
  }
}
