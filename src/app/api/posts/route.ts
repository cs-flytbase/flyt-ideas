import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch all posts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyMine = searchParams.get('onlyMine') === 'true';
    const searchQuery = searchParams.get('search')?.trim();
    
    const session = await auth();
    const userId = session?.userId;

    // Base query to get public posts
    let query = supabase
      .from('posts')
      .select(`
        *,
        comments:post_comments(count)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    // If user is logged in and requesting only their posts
    if (userId && onlyMine) {
      query = supabase
        .from('posts')
        .select(`
          *,
          comments:post_comments(count)
        `)
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });
    } 
    // If user is logged in, also include their private posts
    else if (userId) {
      query = supabase
        .from('posts')
        .select(`
          *,
          comments:post_comments(count)
        `)
        .or(`is_public.eq.true,creator_id.eq.${userId}`)
        .order('created_at', { ascending: false });
    }

    // Add search filter if search query is provided
    if (searchQuery && searchQuery.length > 0) {
      // Create search filters for title, description, and content
      const titleFilter = `title.ilike.%${searchQuery}%`;
      const descriptionFilter = `description.ilike.%${searchQuery}%`;
      const contentFilter = `content.ilike.%${searchQuery}%`;
      
      // Add OR filter for the search term across multiple columns
      query = query.or(`${titleFilter},${descriptionFilter},${contentFilter}`);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // After fetching posts, manually enrich with creator info
    const formattedPosts = await Promise.all(data.map(async (post) => {
      // Get creator info from users table for each post
      const { data: creatorData, error: creatorError } = await supabase
        .from('users')
        .select('display_name, avatar_url')
        .eq('id', post.creator_id)
        .single();
        
      if (creatorError) {
        console.log(`Error fetching creator data for post ${post.id}:`, creatorError);
      }
      
      return {
        ...post,
        creator: {
          id: post.creator_id,
          display_name: creatorData?.display_name || 'Anonymous',
          avatar_url: creatorData?.avatar_url || ''
        }
      };
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST: Create a new post
export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, content, is_public } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Get user's information before creating the post
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .single();

    if (userError) {
      console.log('Error fetching user data:', userError);
      // Continue with default values if there's an error
    }

    // Create the post with the current schema (no creator_name/avatar)
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          title,
          description: description || '',
          content: content || '',
          creator_id: userId,
          is_public: is_public === undefined ? true : is_public,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Return the post with manually added creator information
    const formattedPost = {
      ...data,
      creator: {
        id: userId,
        display_name: userData?.display_name || 'Anonymous',
        avatar_url: userData?.avatar_url || ''
      }
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
