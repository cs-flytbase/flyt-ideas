import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// GET: Fetch personal & shared checklists for an idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id: ideaId } = await params;
  const session = await auth();
  const userId = session?.userId;

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!ideaId) return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });

  try {
    const [personalChecklistsRes, sharedChecklistsRes] = await Promise.all([
      supabase
        .from('checklists')
        .select('*, checklist_items(*)')
        .eq('idea_id', ideaId)
        .eq('creator_id', userId)
        .eq('is_shared', false),

      supabase
        .from('checklists')
        .select(`
          *,
          checklist_items(*, completed_by_user:completed_by(display_name, avatar_url)),
          owner:creator_id(display_name, avatar_url)
        `)
        .eq('idea_id', ideaId)
        .eq('is_shared', true),
    ]);

    if (personalChecklistsRes.error || sharedChecklistsRes.error) {
      throw personalChecklistsRes.error || sharedChecklistsRes.error;
    }

    const addProgress = (checklists: any[]) =>
      checklists.map((cl) => {
        const total = cl.checklist_items.length;
        const completed = cl.checklist_items.filter((item: any) => item.completed).length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { ...cl, progress };
      });

    return NextResponse.json({
      personalChecklists: addProgress(personalChecklistsRes.data || []),
      sharedChecklists: addProgress(sharedChecklistsRes.data || []),
    });
  } catch (error) {
    console.error('Error fetching checklists:', error);
    return NextResponse.json({ error: 'Failed to fetch checklists' }, { status: 500 });
  }
}

// POST: Create a new checklist for an idea
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id: ideaId } = await params;
  const session = await auth();
  const userId = session?.userId;

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!ideaId) return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });

  try {
    const { title, isShared, items } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Create checklist
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        idea_id: ideaId,
        creator_id: userId,
        title,
        is_shared: isShared ?? false,
      })
      .select()
      .single();

    if (checklistError) throw checklistError;

    // Insert checklist items
    if (Array.isArray(items) && items.length > 0) {
      const checklistItems = items.map((item: string | { text: string }) => ({
        checklist_id: checklist.id,
        text: typeof item === 'string' ? item : item.text,
        completed: false,
      }));

      const { error: itemsError } = await supabase
        .from('checklist_items')
        .insert(checklistItems);

      if (itemsError) throw itemsError;
    }

    // Refetch with checklist_items
    const { data: fullChecklist, error: fetchError } = await supabase
      .from('checklists')
      .select('*, checklist_items(*)')
      .eq('id', checklist.id)
      .single();

    if (fetchError) throw fetchError;

    const total = fullChecklist.checklist_items.length;
    const completed = fullChecklist.checklist_items.filter((i: any) => i.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return NextResponse.json({
      ...fullChecklist,
      progress,
    });
  } catch (error) {
    console.error('Error creating checklist:', error);
    return NextResponse.json({ error: 'Failed to create checklist' }, { status: 500 });
  }
}
