import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// PATCH: Update checklist item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } }
): Promise<Response> {
  const { userId } = await auth();
  const itemId = params.itemId;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!itemId) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }

  try {
    const { completed } = await request.json();

    const updateData = {
      completed,
      completed_by: completed ? userId : null,
      completed_at: completed ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from('checklist_items')
      .update(updateData)
      .eq('id', itemId)
      .select(`*, completed_by_user:completed_by(display_name, avatar_url)`)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update checklist item' }, { status: 500 });
  }
}

// DELETE: Remove checklist item (only by owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
): Promise<Response> {
  const { userId } = await auth();
  const itemId = params.itemId;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: item, error } = await supabase
      .from('checklist_items')
      .select(`checklists:checklist_id(creator_id)`)
      .eq('id', itemId)
      .single();

    if (error) throw error;

    const checklist = (item as unknown as { checklists: { creator_id: string }[] }).checklists?.[0];

    if (!checklist || checklist.creator_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete checklist item' }, { status: 500 });
  }
}
