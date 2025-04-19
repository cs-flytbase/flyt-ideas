import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// DELETE: Remove a comment for a post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { userId } = await auth();
  const { id: postId, commentId } = await params;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId)
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting post comment:', err);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
