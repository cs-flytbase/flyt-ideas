import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch a specific checklist with its items and progress
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await auth();
  const userId = session?.userId;
  const { id: checklistId } = await params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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

    if (error) throw error;

    const isOwner = data.creator_id === userId;

    if (!data.is_shared && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (data.is_shared && !isOwner) {
      const { data: assignment, error: assignmentError } = await supabase
        .from('idea_assignments')
        .select('*')
        .eq('idea_id', data.idea_id)
        .eq('user_id', userId)
        .single();

      if (assignmentError || !assignment) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const totalItems = data.checklist_items?.length || 0;
    const completedItems = data.checklist_items?.filter((item: any) => item.completed)?.length || 0;
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

// DELETE: Delete a checklist and related data
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await auth();
  const userId = session?.userId;
  const { id: checklistId } = await params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .select('*')
      .eq('id', checklistId)
      .single();

    if (checklistError) throw checklistError;

    if (checklist.creator_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: activityLogError } = await supabase
      .from('activity_log')
      .delete()
      .eq('checklist_id', checklistId);

    if (activityLogError) {
      console.warn('Failed to delete activity log entries:', activityLogError);
      // Not throwing here so we can still delete the checklist
    }

    const { error: deleteError } = await supabase
      .from('checklists')
      .delete()
      .eq('id', checklistId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting checklist:', error);
    return NextResponse.json({ error: 'Failed to delete checklist' }, { status: 500 });
  }
}
