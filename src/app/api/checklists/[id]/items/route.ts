import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// POST: Add a new checklist item
export async function POST(
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
    // Verify that the user is authorized to add items to this checklist
    // User must either own the checklist or be assigned to the idea
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .select('*, ideas:idea_id(id, creator_id)')
      .eq('id', checklistId)
      .single();

    if (checklistError) {
      throw checklistError;
    }

    const isCreator = checklist.creator_id === userId;
    
    // Check if user is assigned to the idea
    const { data: assignment, error: assignmentError } = await supabase
      .from('idea_assignments')
      .select('*')
      .eq('idea_id', checklist.idea_id)
      .eq('user_id', userId)
      .single();

    const isAssigned = !assignmentError && assignment;

    // Check if shared checklist (anyone assigned can modify)
    const canModify = isCreator || (isAssigned && checklist.is_shared);

    if (!canModify) {
      return NextResponse.json(
        { error: 'You are not authorized to add items to this checklist' },
        { status: 403 }
      );
    }

    const { text, position } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Item text is required' }, { status: 400 });
    }

    // Get the max position in the current checklist
    const { data: positionData, error: positionError } = await supabase
      .from('checklist_items')
      .select('position')
      .eq('checklist_id', checklistId)
      .order('position', { ascending: false })
      .limit(1);

    if (positionError) {
      throw positionError;
    }

    // Calculate the next position (max + 1, or 0 if no items exist)
    const nextPosition = positionData && positionData.length > 0
      ? (positionData[0].position + 1)
      : 0;

    // Insert the checklist item
    const { data: item, error: itemError } = await supabase
      .from('checklist_items')
      .insert([
        {
          checklist_id: checklistId,
          text,
          position: position !== undefined ? position : nextPosition,
          created_by: userId
        }
      ])
      .select()
      .single();

    if (itemError) {
      throw itemError;
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error adding checklist item:', error);
    return NextResponse.json({ error: 'Failed to add checklist item' }, { status: 500 });
  }
}

// PUT: Update a checklist item (toggle completion, edit text, etc.)
export async function PUT(
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
    const { itemId, completed, text, position } = await request.json();

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Verify that the user is authorized to update items in this checklist
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .select('*, ideas:idea_id(id, creator_id)')
      .eq('id', checklistId)
      .single();

    if (checklistError) {
      throw checklistError;
    }

    const isCreator = checklist.creator_id === userId;
    
    // Check if user is assigned to the idea
    const { data: assignment, error: assignmentError } = await supabase
      .from('idea_assignments')
      .select('*')
      .eq('idea_id', checklist.idea_id)
      .eq('user_id', userId)
      .single();

    const isAssigned = !assignmentError && assignment;

    // Check if shared checklist (anyone assigned can modify)
    const canModify = isCreator || (isAssigned && checklist.is_shared);

    if (!canModify) {
      return NextResponse.json(
        { error: 'You are not authorized to update items in this checklist' },
        { status: 403 }
      );
    }

    // Update properties based on what was provided
    const updateData: any = {};
    
    if (text !== undefined) {
      updateData.text = text;
    }
    
    if (position !== undefined) {
      updateData.position = position;
    }
    
    if (completed !== undefined) {
      updateData.completed = completed;
      
      if (completed) {
        updateData.completed_by = userId;
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_by = null;
        updateData.completed_at = null;
      }
    }

    // Update the checklist item
    const { data: item, error: itemError } = await supabase
      .from('checklist_items')
      .update(updateData)
      .eq('id', itemId)
      .eq('checklist_id', checklistId)
      .select(`
        *,
        completed_by_user:completed_by(display_name, avatar_url)
      `)
      .single();

    if (itemError) {
      throw itemError;
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating checklist item:', error);
    return NextResponse.json({ error: 'Failed to update checklist item' }, { status: 500 });
  }
}

// DELETE: Remove a checklist item
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

  const url = new URL(request.url);
  const itemId = url.searchParams.get('itemId');

  if (!itemId) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }

  try {
    // Verify that the user is authorized to delete items from this checklist
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .select('*, ideas:idea_id(id, creator_id)')
      .eq('id', checklistId)
      .single();

    if (checklistError) {
      throw checklistError;
    }

    const isCreator = checklist.creator_id === userId;
    
    // Check if user is assigned to the idea
    const { data: assignment, error: assignmentError } = await supabase
      .from('idea_assignments')
      .select('*')
      .eq('idea_id', checklist.idea_id)
      .eq('user_id', userId)
      .single();

    const isAssigned = !assignmentError && assignment;

    // Only creator of the checklist or owner of the item can delete it
    const { data: item, error: itemFetchError } = await supabase
      .from('checklist_items')
      .select('created_by')
      .eq('id', itemId)
      .eq('checklist_id', checklistId)
      .single();

    if (itemFetchError) {
      throw itemFetchError;
    }

    const isItemCreator = item.created_by === userId;
    const canDelete = isCreator || isItemCreator || (isAssigned && checklist.is_shared);

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You are not authorized to delete items from this checklist' },
        { status: 403 }
      );
    }

    // Delete the checklist item
    const { error: deleteError } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', itemId)
      .eq('checklist_id', checklistId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    return NextResponse.json({ error: 'Failed to delete checklist item' }, { status: 500 });
  }
}
