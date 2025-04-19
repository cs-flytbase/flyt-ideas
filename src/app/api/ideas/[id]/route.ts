import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch full idea details with collaborators and comment count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id: ideaId } = await params;
  const { userId } = await auth();

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  try {
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select(`
        *,
        users:creator_id(display_name, avatar_url),
        idea_collaborators(id, user_id, role, users(display_name, avatar_url))
      `)
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) throw ideaError;

    // const canAccess =
    //   idea.is_public ||
    //   idea.creator_id === userId ||
    //   idea.idea_collaborators.some((collab: any) => collab.user_id === userId);

    // if (!canAccess) {
    //   return NextResponse.json({ error: 'Not authorized to view this idea' }, { status: 403 });
    // }

    const { count: commentCount, error: commentError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId);

    if (commentError) {
      console.warn('Failed to fetch comment count:', commentError.message);
    }

    return NextResponse.json({
      ...idea,
      comment_count: commentCount || 0,
    });
  } catch (error) {
    console.error('GET idea error:', error);
    return NextResponse.json({ error: 'Failed to fetch idea' }, { status: 500 });
  }
}

// PATCH: Update an idea (creator only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id: ideaId } = await params;
  const { userId } = await auth();

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!ideaId) return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });

  try {
    const { data: idea, error } = await supabase
      .from('ideas')
      .select('creator_id, is_published')
      .eq('id', ideaId)
      .single();

    if (error || !idea) throw error;

    if (idea.creator_id !== userId) {
      return NextResponse.json({ error: 'Only the creator can edit this idea' }, { status: 403 });
    }

    const updates = await request.json();
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if ('title' in updates) updateData.title = updates.title;
    if ('description' in updates) updateData.description = updates.description;
    if ('status' in updates) updateData.status = updates.status;

    if (updates.is_published === true && !idea.is_published) {
      updateData.is_published = true;
      updateData.published_at = new Date().toISOString();
    } else if ('is_published' in updates) {
      updateData.is_published = updates.is_published;
    }

    const { data: updated, error: updateError } = await supabase
      .from('ideas')
      .update(updateData)
      .eq('id', ideaId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH idea error:', error);
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
  }
}

// DELETE: Remove an idea (creator only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id: ideaId } = await params;
  const { userId } = await auth();

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!ideaId) return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });

  try {
    const { data: idea, error: fetchError } = await supabase
      .from('ideas')
      .select('creator_id')
      .eq('id', ideaId)
      .single();

    if (fetchError || !idea) throw fetchError;

    if (idea.creator_id !== userId) {
      return NextResponse.json({ error: 'Only the creator can delete this idea' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('ideas')
      .delete()
      .eq('id', ideaId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE idea error:', error);
    return NextResponse.json({ error: 'Failed to delete idea' }, { status: 500 });
  }
}
