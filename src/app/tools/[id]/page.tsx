import { supabase } from '@/lib/supabase';
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { NextApiRequest } from 'next';
import type { NextRequest as AppNextRequest } from 'next/server';

// 👇 import the correct type for context
// import type { NextRequest } from 'next/server';
import type { NextApiResponse } from 'next';
import type { NextApiHandler } from 'next';

export async function DELETE(
  request: NextRequest,
  context: { params: { itemId: string } }
): Promise<Response> {
  const itemId = context.params.itemId;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!itemId) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }

  try {
    const { data: item, error: itemError } = await supabase
      .from('checklist_items')
      .select(`
        checklist_id,
        checklists:checklist_id(creator_id)
      `)
      .eq('id', itemId)
      .single();

    if (itemError) {
      throw itemError;
    }

    const checklist = (item as any).checklists;

    if (!checklist || checklist.creator_id !== userId) {
      return NextResponse.json({ error: 'Only the checklist owner can delete items' }, { status: 403 });
    }

    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    return NextResponse.json({ error: 'Failed to delete checklist item' }, { status: 500 });
  }
}
