import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch a specific checklist with its items
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.userId;
  const checklistId = context.params.id;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!checklistId) {
    return NextResponse.json({ error: 'Checklist ID is required' }, { status: 400 });
  }

  try {
    // Get the checklist with its items
    const { data, error } = await supabase
      .from('checklists')
      .select(`
        *,
        checklist_items(
          *,
          completed_by_user:completed_by(display_name, avatar_url)
        ),
        owner:creator_id(display_name, avatar_url)
      `)
      .eq('id', checklistId)
      .single();

    if (error) {
      throw error;
    }

    // Check if user is authorized to view this checklist
    const isOwner = data.creator_id === userId;
    
    // If it's a personal checklist, only the creator can view it
    if (!data.is_shared && !isOwner) {
      return NextResponse.json(
        { error: 'You are not authorized to view this checklist' },
        { status: 403 }
      );
    }

    // If it's a shared checklist, check if user is assigned to the idea
    if (data.is_shared && !isOwner) {
      const { data: assignment, error: assignmentError } = await supabase
        .from('idea_assignments')
        .select('*')
        .eq('idea_id', data.idea_id)
        .eq('user_id', userId)
        .single();

      if (assignmentError || !assignment) {
        return NextResponse.json(
          { error: 'You are not authorized to view this checklist' },
          { status: 403 }
        );
      }
    }

    // Calculate progress
    const totalItems = data.checklist_items.length;
    const completedItems = data.checklist_items.filter((item: any) => item.completed).length;
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return NextResponse.json({
      ...data,
      progress
    });
  } catch (error) {
    console.error('Error fetching checklist:', error);
    return NextResponse.json({ error: 'Failed to fetch checklist' }, { status: 500 });
  }
}

// DELETE: Delete a checklist and all its items
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.userId;
  const checklistId = context.params.id;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!checklistId) {
    return NextResponse.json({ error: 'Checklist ID is required' }, { status: 400 });
  }

  try {
    // Get the checklist to verify ownership
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .select('*')
      .eq('id', checklistId)
      .single();

    if (checklistError) {
      throw checklistError;
    }

    // Only the creator can delete a checklist
    if (checklist.creator_id !== userId) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this checklist' },
        { status: 403 }
      );
    }

    // First, delete any references in the activity_log table
    const { error: activityLogError } = await supabase
      .from('activity_log')
      .delete()
      .eq('checklist_id', checklistId);

    if (activityLogError) {
      console.error('Error deleting activity log entries:', activityLogError);
      // Continue even if there's an error with activity log deletion
    }

    // Delete the checklist (items will be cascaded due to FK constraints)
    const { error: deleteError } = await supabase
      .from('checklists')
      .delete()
      .eq('id', checklistId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting checklist:', error);
    return NextResponse.json({ error: 'Failed to delete checklist' }, { status: 500 });
  }
}
