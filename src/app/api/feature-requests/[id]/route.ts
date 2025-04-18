import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch feature request details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  try {
    const { data: featureRequest, error } = await supabase
      .from('feature_requests')
      .select(`
        id,
        title,
        description,
        status,
        category,
        upvotes,
        created_at,
        creator_id
      `)
      .eq('id', id)
      .single();

    if (error || !featureRequest) {
      console.error('Error fetching feature request:', error);
      return NextResponse.json({ error: 'Feature request not found' }, { status: 404 });
    }

    const { data: creatorData } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .eq('id', featureRequest.creator_id)
      .single();

    const { data: commentsData } = await supabase
      .from('feature_request_comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        users:user_id(id, display_name, avatar_url)
      `)
      .eq('feature_request_id', id)
      .order('created_at', { ascending: true });

    const formattedResponse = {
      id: featureRequest.id,
      title: featureRequest.title,
      description: featureRequest.description,
      status: featureRequest.status,
      category: featureRequest.category,
      upvotes: featureRequest.upvotes,
      createdAt: featureRequest.created_at,
      createdBy: creatorData
        ? {
            id: creatorData.id,
            name: creatorData.display_name || 'Anonymous',
            avatarUrl: creatorData.avatar_url || '',
          }
        : {
            id: featureRequest.creator_id,
            name: 'Anonymous',
            avatarUrl: '',
          },
      comments: commentsData?.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        user: comment.users
          ? {
              id: comment.users.id,
              name: comment.users.display_name || 'Anonymous',
              avatarUrl: comment.users.avatar_url || '',
            }
          : {
              id: comment.user_id,
              name: 'Anonymous',
              avatarUrl: '',
            },
      })) ?? [],
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json({ error: 'Failed to fetch feature request details' }, { status: 500 });
  }
}

// POST: Add comment to feature request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const session = await auth();
  const userId = session?.userId;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    const { data: featureRequest, error: featureRequestError } = await supabase
      .from('feature_requests')
      .select('id, title, creator_id')
      .eq('id', id)
      .single();

    if (featureRequestError || !featureRequest) {
      return NextResponse.json({ error: 'Feature request not found' }, { status: 404 });
    }

    const { data: newComment, error: insertError } = await supabase
      .from('feature_request_comments')
      .insert({
        feature_request_id: id,
        user_id: userId,
        content: content.trim(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const { data: userData } = await supabase
      .from('users')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .single();

    const response = {
      id: newComment.id,
      content: newComment.content,
      createdAt: newComment.created_at,
      user: {
        id: userId,
        name: userData?.display_name || 'User',
        avatarUrl: userData?.avatar_url || '',
      },
    };

    // Create notification for the creator
    if (featureRequest.creator_id !== userId) {
      await supabase.from('notifications').insert({
        type: 'comment',
        title: 'New comment on your feature request',
        content: `Someone commented on your "${featureRequest.title}" feature request`,
        recipient_id: featureRequest.creator_id,
        sender_id: userId,
        source_url: `/feature-requests/${id}`,
        is_read: false,
      });
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}

// PATCH: Update feature request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const session = await auth();
  const userId = session?.userId;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status } = await request.json();

    const { data: featureRequest, error: fetchError } = await supabase
      .from('feature_requests')
      .select('id, creator_id')
      .eq('id', id)
      .single();

    if (fetchError || !featureRequest) {
      return NextResponse.json({ error: 'Feature request not found' }, { status: 404 });
    }

    if (featureRequest.creator_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('feature_requests')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updated_at,
    });
  } catch (error) {
    console.error('Error in PATCH handler:', error);
    return NextResponse.json({ error: 'Failed to update feature request' }, { status: 500 });
  }
}
