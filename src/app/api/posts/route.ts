import { supabase } from '@/lib/supabase';
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch all posts (public, private, or user-specific)
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const onlyMine = searchParams.get('onlyMine') === 'true';
    const searchQuery = searchParams.get('search')?.trim();

    const session = await auth();
    const userId = session?.userId;

    let query = supabase
      .from('posts')
      .select(`
        *,
        comments:post_comments(count)
      `)
      .order('created_at', { ascending: false });

    // Auth logic
    if (userId && onlyMine) {
      query = query.eq('creator_id', userId);
    } else if (userId) {
      query = query.or(`is_public.eq.true,creator_id.eq.${userId}`);
    } else {
      query = query.eq('is_public', true);
    }

    // Search filter
    if (searchQuery) {
      query = query.or(`
        title.ilike.%${searchQuery}%,
        description.ilike.%${searchQuery}%,
        content.ilike.%${searchQuery}%
      `);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Enrich posts with creator profile
    const posts = await Promise.all(
      (data || []).map(async (post) => {
        const { data: creator, error: creatorError } = await supabase
          .from('users')
          .select('display_name, avatar_url')
          .eq('id', post.creator_id)
          .single();

        if (creatorError) {
          console.warn(`Error loading user for post ${post.id}:`, creatorError);
        }

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

    return NextResponse.json(posts);
  } catch (error) {
    console.error('GET posts error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST: Create a new post
export async function POST(request: NextRequest): Promise<Response> {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, content, is_public } = await request.json();

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .single();

    if (userError) {
      console.warn('Could not fetch user data for new post:', userError);
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert([
        {
          title,
          description: description || '',
          content: content || '',
          is_public: is_public ?? true,
          creator_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      ...post,
      creator: {
        id: userId,
        display_name: userData?.display_name || 'Anonymous',
        avatar_url: userData?.avatar_url || '',
      },
    });
  } catch (error) {
    console.error('POST post error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
