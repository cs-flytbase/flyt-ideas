import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

function calculateProgress(checklistItems: any[]) {
  const total = checklistItems.length;
  const done = checklistItems.filter(item => item.completed).length;
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

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
    const [personalRes, sharedRes] = await Promise.all([
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

    if (personalRes.error || sharedRes.error) {
      throw personalRes.error || sharedRes.error;
    }

    const formatWithProgress = (list: any[]) =>
      list.map(cl => ({
        ...cl,
        progress: calculateProgress(cl.checklist_items),
      }));

    return NextResponse.json({
      personalChecklists: formatWithProgress(personalRes.data ?? []),
      sharedChecklists: formatWithProgress(sharedRes.data ?? []),
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

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Checklist title is required' }, { status: 400 });
    }

    // Step 1: Create checklist
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

    // Step 2: Insert checklist items (if any)
    if (Array.isArray(items) && items.length > 0) {
      const checklistItems = items.map((item: string | { text: string }) => ({
        checklist_id: checklist.id,
        text: typeof item === 'string' ? item : item.text,
        completed: false,
      }));

      const { error: itemError } = await supabase
        .from('checklist_items')
        .insert(checklistItems);

      if (itemError) throw itemError;
    }

    // Step 3: Fetch full checklist with items
    const { data: fullChecklist, error: fetchError } = await supabase
      .from('checklists')
      .select('*, checklist_items(*)')
      .eq('id', checklist.id)
      .single();

    if (fetchError) throw fetchError;

    return NextResponse.json({
      ...fullChecklist,
      progress: calculateProgress(fullChecklist.checklist_items),
    });
  } catch (error) {
    console.error('POST checklist error:', error);
    return NextResponse.json({ error: 'Failed to create checklist' }, { status: 500 });
  }
}
