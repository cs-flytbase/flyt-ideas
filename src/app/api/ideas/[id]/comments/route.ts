import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch personal & shared checklists for an idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id: ideaId } = await params;
  const session = await auth();
  const userId = session?.userId;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ideaId) {
    return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 });
  }

  try {
    const [personal, shared] = await Promise.all([
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

    if (personal.error || shared.error) {
      throw personal.error || shared.error;
    }

    const withProgress = (checklists: any[]) =>
      checklists.map((cl) => {
        const total = cl.checklist_items.length;
        const done = cl.checklist_items.filter((i: any) => i.completed).length;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        return { ...cl, progress };
      });

    return NextResponse.json({
      personalChecklists: withProgress(personal.data || []),
      sharedChecklists: withProgress(shared.data || []),
    });
  } catch (error) {
    console.error('GET checklists error:', error);
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

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

    // Insert items if provided
    if (Array.isArray(items) && items.length > 0) {
      const insertItems = items.map((item: string | { text: string }) => ({
        checklist_id: checklist.id,
        text: typeof item === 'string' ? item : item.text,
        completed: false,
      }));

      const { error: itemsError } = await supabase
        .from('checklist_items')
        .insert(insertItems);

      if (itemsError) throw itemsError;
    }

    // Fetch full checklist with items
    const { data: fullChecklist, error: fetchError } = await supabase
      .from('checklists')
      .select('*, checklist_items(*)')
      .eq('id', checklist.id)
      .single();

    if (fetchError) throw fetchError;

    const total = fullChecklist.checklist_items.length;
    const completed = fullChecklist.checklist_items.filter((i: any) => i.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return NextResponse.json({ ...fullChecklist, progress });
  } catch (error) {
    console.error('POST checklist error:', error);
    return NextResponse.json({ error: 'Failed to create checklist' }, { status: 500 });
  }
}
