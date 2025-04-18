import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const itemId = params.itemId;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: item, error: itemError } = await supabase
      .from('checklist_items')
      .select(`checklist_id, checklists:checklist_id(creator_id)`)
      .eq('id', itemId)
      .single();

    if (itemError) throw itemError;

    const checklist = (item as any).checklists;

    if (!checklist || checklist.creator_id !== userId) {
      return NextResponse.json({ error: 'Only the checklist owner can delete items' }, { status: 403 });
    }

    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    return NextResponse.json({ error: 'Failed to delete checklist item' }, { status: 500 });
  }
}
