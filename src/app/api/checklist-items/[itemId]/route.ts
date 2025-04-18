import { supabase } from '@/lib/supabase';
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Define types for our database responses
interface ChecklistItem {
  id: string;
  checklist_id: string;
  text: string;
  position: number;
  completed: boolean;
  completed_by: string | null;
  completed_at: string | null;
  checklists?: {
    creator_id: string;
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
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

    // Update the item completion status
    const updateData: any = {
      completed: completed
    };

    // If marking as completed, set completed_by and completed_at
    if (completed) {
      updateData.completed_by = userId;
      updateData.completed_at = new Date().toISOString();
    } else {
      // If marking as incomplete, clear these fields
      updateData.completed_by = null;
      updateData.completed_at = null;
    }

    const { data, error } = await supabase
      .from('checklist_items')
      .update(updateData)
      .eq('id', itemId)
      .select(`
        *,
        completed_by_user:completed_by(display_name, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating checklist item:', error);
    return NextResponse.json({ error: 'Failed to update checklist item' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: { itemId: string } }
): Promise<Response> {
  const { params } = context;
  const itemId = params.itemId;
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!itemId) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }

  try {
    // First check if user has right to delete this item (is owner of the checklist)
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

    // Use a safer approach with proper typing
    const checklist = (item as unknown as any).checklists;
    
    // Check if the user is the creator of the checklist
    if (!checklist || !checklist.creator_id || checklist.creator_id !== userId) {
      return NextResponse.json({ error: 'Only the checklist owner can delete items' }, { status: 403 });
    }

    // Delete the item
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
