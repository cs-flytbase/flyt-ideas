import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.userId;
  const { id: ideaId } = await context.params;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  try {
    // Get personal checklists (owned by the user)
    const { data: personalChecklists, error: personalError } = await supabase
      .from('checklists')
      .select(`
        *,
        checklist_items(*)
      `)
      .eq('idea_id', ideaId)
      .eq('creator_id', userId)
      .eq('is_shared', false);

    if (personalError) {
      throw personalError;
    }

    // Get shared checklists (visible to all collaborators)
    const { data: sharedChecklists, error: sharedError } = await supabase
      .from('checklists')
      .select(`
        *,
        checklist_items(
          *,
          completed_by_user:completed_by(display_name, avatar_url)
        ),
        owner:creator_id(display_name, avatar_url)
      `)
      .eq('idea_id', ideaId)
      .eq('is_shared', true);

    if (sharedError) {
      throw sharedError;
    }

    // Calculate progress for each checklist
    const processedPersonalChecklists = personalChecklists.map((checklist: any) => {
      const totalItems = checklist.checklist_items.length;
      const completedItems = checklist.checklist_items.filter((item: any) => item.completed).length;
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      
      return {
        ...checklist,
        progress
      };
    });

    const processedSharedChecklists = sharedChecklists.map((checklist: any) => {
      const totalItems = checklist.checklist_items.length;
      const completedItems = checklist.checklist_items.filter((item: any) => item.completed).length;
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      
      return {
        ...checklist,
        progress
      };
    });

    return NextResponse.json({
      personalChecklists: processedPersonalChecklists,
      sharedChecklists: processedSharedChecklists
    });
  } catch (error) {
    console.error('Error fetching checklists:', error);
    return NextResponse.json({ error: 'Failed to fetch checklists' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.userId;
  const { id: ideaId } = await context.params;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  try {
    const { title, isShared, items } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Insert the checklist
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .insert([
        {
          idea_id: ideaId,
          creator_id: userId,
          title,
          is_shared: isShared || false
        }
      ])
      .select()
      .single();

    if (checklistError) {
      throw checklistError;
    }

    // If there are items, insert them
    if (items && items.length > 0) {
      const checklistItems = items.map((item: string | { text: string }) => ({
        checklist_id: checklist.id,
        text: typeof item === 'string' ? item : item.text,
        completed: false
      }));

      const { error: itemsError } = await supabase
        .from('checklist_items')
        .insert(checklistItems);

      if (itemsError) {
        throw itemsError;
      }
    }

    // Return the created checklist with items
    const { data: fullChecklist, error: fetchError } = await supabase
      .from('checklists')
      .select(`
        *,
        checklist_items(*)
      `)
      .eq('id', checklist.id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Calculate progress
    const totalItems = fullChecklist.checklist_items.length;
    const completedItems = fullChecklist.checklist_items.filter((item: { completed: boolean }) => item.completed).length;
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return NextResponse.json({
      ...fullChecklist,
      progress
    });
  } catch (error) {
    console.error('Error creating checklist:', error);
    return NextResponse.json({ error: 'Failed to create checklist' }, { status: 500 });
  }
}
