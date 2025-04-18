import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch a single post by ID
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const session = await auth();
    const userId = session?.userId;

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Build query based on authentication
    let query = supabase
      .from('posts')
      .select(`
        *,
        creator:creator_id(id, display_name, avatar_url)
      `)
      .eq('id', id);

    // If user is not logged in, only allow viewing public posts
    if (!userId) {
      query = query.eq('is_public', true);
    } else {
      // If user is logged in, they can view their own posts or public posts
      query = query.or(`is_public.eq.true,creator_id.eq.${userId}`);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

// PUT: Update a post
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if post exists and belongs to the user
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (existingPost.creator_id !== userId) {
      return NextResponse.json({ error: 'You can only update your own posts' }, { status: 403 });
    }

    const { title, description, content, is_public } = await request.json();
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (is_public !== undefined) updateData.is_public = is_public;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .eq('creator_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE: Delete a post
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if post exists and belongs to the user
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('creator_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (existingPost.creator_id !== userId) {
      return NextResponse.json({ error: 'You can only delete your own posts' }, { status: 403 });
    }

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('creator_id', userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
