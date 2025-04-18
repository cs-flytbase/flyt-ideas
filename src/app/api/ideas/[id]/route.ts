import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  const ideaId = params.id;

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  try {
    // Get the idea details
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select(`
        *,
        users:creator_id(display_name, avatar_url),
        idea_collaborators(
          id,
          user_id,
          role,
          users(display_name, avatar_url)
        )
      `)
      .eq('id', ideaId)
      .single();

    if (ideaError) {
      throw ideaError;
    }

    // Check if user has access to this idea
    const canAccess = idea.is_public || 
                     idea.creator_id === userId ||
                     idea.idea_collaborators.some((collab: any) => collab.user_id === userId);

    if (!canAccess) {
      return NextResponse.json({ error: 'Not authorized to view this idea' }, { status: 403 });
    }

    // Get comment count for this idea
    const { count: commentCount, error: commentCountError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId);

    if (commentCountError) {
      console.error('Error fetching comment count:', commentCountError);
      // Continue with 0 comments if there's an error
    }

    // Add comment count to the idea data
    const ideaWithCommentCount = {
      ...idea,
      comment_count: commentCount || 0
    };

    return NextResponse.json(ideaWithCommentCount);
  } catch (error) {
    console.error('Error fetching idea:', error);
    return NextResponse.json({ error: 'Failed to fetch idea' }, { status: 500 });
  }
}

export async function PATCH(
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
    // First check if user is creator of the idea
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('creator_id, is_published')
      .eq('id', ideaId)
      .single();

    if (ideaError) {
      throw ideaError;
    }

    if (idea.creator_id !== userId) {
      return NextResponse.json({ error: 'Only the creator can edit this idea' }, { status: 403 });
    }

    // Get the update data
    const updates = await request.json();
    
    // Create the update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Add fields from the request if they exist
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    
    // Handle publishing specifically:
    // If is_published is true and the idea isn't already published, set published_at
    if (updates.is_published === true && !idea.is_published) {
      updateData.is_published = true;
      updateData.published_at = new Date().toISOString();
    }
    // Only allow publishing, not unpublishing
    else if (updates.is_published !== undefined) {
      updateData.is_published = updates.is_published;
    }
    
    // Update the idea
    const { data, error } = await supabase
      .from('ideas')
      .update(updateData)
      .eq('id', ideaId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating idea:', error);
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
  }
}

export async function DELETE(
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
    // First check if user is creator of the idea
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('creator_id')
      .eq('id', ideaId)
      .single();

    if (ideaError) {
      throw ideaError;
    }

    if (idea.creator_id !== userId) {
      return NextResponse.json({ error: 'Only the creator can delete this idea' }, { status: 403 });
    }

    // Delete the idea
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', ideaId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting idea:', error);
    return NextResponse.json({ error: 'Failed to delete idea' }, { status: 500 });
  }
}
