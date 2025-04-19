import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch all posts (public, user-specific, or private)
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const onlyMine = searchParams.get('onlyMine') === 'true';
    const searchQuery = searchParams.get('search')?.trim();

    const { userId } = await auth();

    let query = supabase
      .from('posts')
      .select('*, comments:post_comments(count)')
      .order('created_at', { ascending: false });

    // Filter based on auth and privacy
    if (userId && onlyMine) {
      query = query.eq('creator_id', userId);
    } else if (userId) {
      query = query.or(`is_public.eq.true,creator_id.eq.${userId}`);
    } else {
      query = query.eq('is_public', true);
    }

    // Optional search filter
    if (searchQuery) {
      query = query.or(`
        title.ilike.%${searchQuery}%,
        description.ilike.%${searchQuery}%,
        content.ilike.%${searchQuery}%
      `);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Attach creator profile to each post
    const enrichedPosts = await Promise.all(
      (data || []).map(async (post) => {
        const { data: creator, error: userError } = await supabase
          .from('users')
          .select('display_name, avatar_url')
          .eq('id', post.creator_id)
          .single();

        return {
          ...post,
          creator: {
            id: post.creator_id,
            display_name: creator?.display_name || 'Anonymous',
            avatar_url: creator?.avatar_url || '',
          },
        };
      })
    );

    return NextResponse.json({ posts: enrichedPosts });
  } catch (error) {
    console.error('GET /posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST: Create a new post
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, content, is_public } = await request.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .single();

    if (userError) {
      console.warn('Warning: Failed to fetch user data for post.', userError.message);
    }

    const { data: post, error: insertError } = await supabase
      .from('posts')
      .insert([{
        title: title.trim(),
        description: description || '',
        content: content || '',
        is_public: is_public ?? true,
        creator_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      ...post,
      creator: {
        id: userId,
        display_name: user?.display_name || 'Anonymous',
        avatar_url: user?.avatar_url || '',
      },
    });
  } catch (error) {
    console.error('POST /posts error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
