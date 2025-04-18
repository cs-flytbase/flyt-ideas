import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Utility to check user access to modify a checklist
async function canUserModifyChecklist(checklistId: string, userId: string) {
  const { data: checklist, error: checklistError } = await supabase
    .from('checklists')
    .select('*, ideas:idea_id(id, creator_id)')
    .eq('id', checklistId)
    .single();

  if (checklistError) throw checklistError;

  const isCreator = checklist.creator_id === userId;

  const { data: assignment, error: assignmentError } = await supabase
    .from('idea_assignments')
    .select('*')
    .eq('idea_id', checklist.idea_id)
    .eq('user_id', userId)
    .single();

  const isAssigned = !assignmentError && assignment;
  const canModify = isCreator || (isAssigned && checklist.is_shared);

  return { canModify, checklist, isCreator };
}

// POST: Add new checklist item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await auth();
  const userId = session?.userId;
  const { id: checklistId } = await params;

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { canModify } = await canUserModifyChecklist(checklistId, userId);

    if (!canModify) {
      return NextResponse.json({ error: 'Not authorized to add items' }, { status: 403 });
    }

    const { text, position } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Item text is required' }, { status: 400 });
    }

    const { data: positionData } = await supabase
      .from('checklist_items')
      .select('position')
      .eq('checklist_id', checklistId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = positionData?.[0]?.position + 1 || 0;

    const { data: item, error: itemError } = await supabase
      .from('checklist_items')
      .insert([{
        checklist_id: checklistId,
        text,
        position: position ?? nextPosition,
        created_by: userId,
      }])
      .select()
      .single();

    if (itemError) throw itemError;

    return NextResponse.json(item);
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Failed to add checklist item' }, { status: 500 });
  }
}

// PUT: Update checklist item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await auth();
  const userId = session?.userId;
  const { id: checklistId } = await params;

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { canModify } = await canUserModifyChecklist(checklistId, userId);

    if (!canModify) {
      return NextResponse.json({ error: 'Not authorized to update items' }, { status: 403 });
    }

    const { itemId, completed, text, position } = await request.json();

    if (!itemId) return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });

    const updateData: any = { };
    if (text !== undefined) updateData.text = text;
    if (position !== undefined) updateData.position = position;
    if (completed !== undefined) {
      updateData.completed = completed;
      updateData.completed_by = completed ? userId : null;
      updateData.completed_at = completed ? new Date().toISOString() : null;
    }

    const { data: item, error: itemError } = await supabase
      .from('checklist_items')
      .update(updateData)
      .eq('id', itemId)
      .eq('checklist_id', checklistId)
      .select(`*, completed_by_user:completed_by(display_name, avatar_url)`)
      .single();

    if (itemError) throw itemError;

    return NextResponse.json(item);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Failed to update checklist item' }, { status: 500 });
  }
}

// DELETE: Remove checklist item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const session = await auth();
  const userId = session?.userId;
  const { id: checklistId } = await params;

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const itemId = new URL(request.url).searchParams.get('itemId');

  if (!itemId) return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });

  try {
    const { canModify, checklist, isCreator } = await canUserModifyChecklist(checklistId, userId);

    const { data: item, error: fetchError } = await supabase
      .from('checklist_items')
      .select('created_by')
      .eq('id', itemId)
      .eq('checklist_id', checklistId)
      .single();

    if (fetchError) throw fetchError;

    const isItemCreator = item.created_by === userId;
    const canDelete = isCreator || isItemCreator || (canModify && checklist.is_shared);

    if (!canDelete) {
      return NextResponse.json({ error: 'Not authorized to delete this item' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', itemId)
      .eq('checklist_id', checklistId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete checklist item' }, { status: 500 });
  }
}
