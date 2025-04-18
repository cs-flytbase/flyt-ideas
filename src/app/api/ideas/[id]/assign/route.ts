import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// POST: Assign user to idea
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id: ideaId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  try {
    // Confirm idea exists
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, title, is_published')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    // Check if user already assigned
    const { data: existingAssignment } = await supabase
      .from('idea_assignments')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .single();

    if (existingAssignment) {
      return NextResponse.json({
        message: 'User already assigned to this idea',
        assignment: existingAssignment,
      });
    }

    // Assign user
    const { data: assignment, error: assignError } = await supabase
      .from('idea_assignments')
      .insert([
        {
          idea_id: ideaId,
          user_id: userId,
          status: 'in_progress',
          assigned_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (assignError) throw assignError;

    return NextResponse.json({
      message: 'User successfully assigned to idea',
      assignment,
    });
  } catch (error) {
    console.error('POST error (assignment):', error);
    return NextResponse.json(
      {
        error: 'Failed to assign user to idea',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// GET: Retrieve all assignments for an idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id: ideaId } = await params;

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('idea_assignments')
      .select(`
        *,
        user:user_id(id, display_name, avatar_url)
      `)
      .eq('idea_id', ideaId)
      .order('assigned_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ assignments: data });
  } catch (error) {
    console.error('GET error (assignments):', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

// DELETE: Remove current user's assignment from an idea
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id: ideaId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('idea_assignments')
      .delete()
      .eq('idea_id', ideaId)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ message: 'Assignment successfully removed' });
  } catch (error) {
    console.error('DELETE error (assignment):', error);
    return NextResponse.json({ error: 'Failed to remove assignment' }, { status: 500 });
  }
}
