import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GET: Fetch public ideas or user's ideas
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const publicOnly = searchParams.get('public') === 'true';

  try {
    const session = await auth();
    const userId = session?.userId;

    // 🔓 Public ideas (no login required)
    if (publicOnly) {
      const { data: publishedIdeas, error } = await supabase
        .from('ideas')
        .select('*, comments(count)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedIdeas = await Promise.all(
        publishedIdeas.map(async (idea) => {
          const { data: userData } = await supabase
            .from('users')
            .select('display_name, avatar_url')
            .eq('id', idea.creator_id)
            .single();

          return {
            ...idea,
            commentCount: idea.comments.count || 0,
            users: userData ?? {
              display_name: 'Anonymous',
              avatar_url: '',
            },
          };
        })
      );

      return NextResponse.json({ ideas: formattedIdeas });
    }

    // 🔐 Authenticated access to own & collaborated ideas
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: myIdeas, error: myIdeasError } = await supabase
      .from('ideas')
      .select('*, comments(count), users:creator_id(display_name, avatar_url)')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (myIdeasError) throw myIdeasError;

    const { data: collaboratedIdeas, error: collaboratedIdeasError } = await supabase
      .from('ideas')
      .select('*, comments(count), users:creator_id(display_name, avatar_url), idea_collaborators!inner(*)')
      .eq('idea_collaborators.user_id', userId)
      .neq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (collaboratedIdeasError) throw collaboratedIdeasError;

    const format = (ideas) =>
      ideas.map((idea) => ({
        ...idea,
        commentCount: idea.comments?.count || 0,
      }));

    return NextResponse.json({
      myIdeas: format(myIdeas),
      collaboratedIdeas: format(collaboratedIdeas),
    });
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
  }
}

// POST: Create a new idea
export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  const userId = session?.userId;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, isPublished, tags, status } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Ensure user exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError && userError.code !== 'PGRST116') throw userError;

    if (!existingUser) {
      const { error: createUserError } = await supabase.from('users').insert([
        {
          id: userId,
          display_name: 'User',
          is_online: true,
          last_active: new Date().toISOString(),
        },
      ]);
      if (createUserError) throw createUserError;
    }

    const { data, error } = await supabase
      .from('ideas')
      .insert([
        {
          title,
          description: description || '',
          is_published: isPublished === true,
          creator_id: userId,
          status: status || 'draft',
          upvotes: 0,
          tags: tags || [],
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ idea: data[0] });
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 });
  }
}

// PUT: Update current user info
export async function PUT(request: NextRequest): Promise<Response> {
  const session = await auth();
  const userId = session?.userId;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, firstName, lastName, avatarUrl } = await request.json();

    const displayName = `${firstName ?? ''} ${lastName ?? ''}`.trim() || 'User';

    const { error } = await supabase
      .from('users')
      .update({
        email: email || '',
        display_name: displayName,
        avatar_url: avatarUrl || '',
      })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
