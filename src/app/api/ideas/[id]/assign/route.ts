import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// API endpoint for assigning users to ideas
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  // Extract the idea ID from the params object
  const { id: ideaId } = params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  try {
    // Check if idea exists
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, title, is_published')
      .eq('id', ideaId)
      .single();

    if (ideaError) {
      throw new Error('Idea not found');
    }

    // Check if user is already assigned to this idea
    const { data: existingAssignment, error: checkError } = await supabase
      .from('idea_assignments')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('user_id', userId)
      .single();

    // If there's an existing assignment, return it
    if (existingAssignment) {
      return NextResponse.json({ 
        message: 'User is already assigned to this idea',
        assignment: existingAssignment
      });
    }

    // Create a new assignment
    const { data: assignment, error: assignError } = await supabase
      .from('idea_assignments')
      .insert([
        {
          idea_id: ideaId,
          user_id: userId,
          status: 'in_progress',
          assigned_at: new Date().toISOString()
        }
      ])
      .select();

    if (assignError) {
      throw assignError;
    }

    return NextResponse.json({ 
      message: 'User successfully assigned to idea',
      assignment: assignment[0]
    });
  } catch (error) {
    console.error('Error assigning user to idea:', error);
    return NextResponse.json({ 
      error: 'Failed to assign user to idea',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Get all assignments for an idea
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Extract the idea ID from the params object
  const { id: ideaId } = params;

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  try {
    // Get all assignments for this idea with user details
    const { data, error } = await supabase
      .from('idea_assignments')
      .select(`
        *,
        user:user_id(id, display_name, avatar_url)
      `)
      .eq('idea_id', ideaId)
      .order('assigned_at', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ assignments: data });
  } catch (error) {
    console.error('Error fetching idea assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

// Remove a user's assignment from an idea
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  // Extract the idea ID from the params object
  const { id: ideaId } = params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  try {
    // Delete the assignment
    const { error } = await supabase
      .from('idea_assignments')
      .delete()
      .eq('idea_id', ideaId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      message: 'Assignment successfully removed' 
    });
  } catch (error) {
    console.error('Error removing assignment:', error);
    return NextResponse.json({ 
      error: 'Failed to remove assignment' 
    }, { status: 500 });
  }
}
