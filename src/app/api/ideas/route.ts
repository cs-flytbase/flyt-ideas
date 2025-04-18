import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicOnly = searchParams.get('public');
  const session = await auth();
  const userId = session?.userId;
  
  // Handle request for public/published ideas only
  if (publicOnly === 'true') {
    try {
      // Get all published ideas, no auth required
      const { data: publishedIdeas, error } = await supabase
        .from('ideas')
        .select(`
          *,
          comments(count)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      // Fetch user info for each idea creator
      const formattedIdeas = await Promise.all(publishedIdeas.map(async (idea) => {
        // Get creator info from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('display_name, avatar_url')
          .eq('id', idea.creator_id)
          .single();
          
        return {
          ...idea,
          commentCount: idea.comments.count || 0,
          users: userData ? {
            display_name: userData.display_name || 'Anonymous',
            avatar_url: userData.avatar_url || ''
          } : {
            display_name: 'Anonymous',
            avatar_url: ''
          }
        };
      }));

      return NextResponse.json({
        ideas: formattedIdeas
      });
    } catch (error) {
      console.error('Error fetching ideas:', error);
      return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
    }
  }
  
  // Original implementation for authenticated users
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user's own ideas (now including comment counts)
    const { data: myIdeas, error: myIdeasError } = await supabase
      .from('ideas')
      .select(`
        *,
        comments(count),
        users:creator_id(display_name, avatar_url)
      `)
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (myIdeasError) {
      throw myIdeasError;
    }

    // Get ideas where user is a collaborator (now including comment counts)
    const { data: collaboratedIdeas, error: collaboratedIdeasError } = await supabase
      .from('ideas')
      .select(`
        *,
        comments(count),
        users:creator_id(display_name, avatar_url),
        idea_collaborators!inner(*)
      `)
      .eq('idea_collaborators.user_id', userId)
      .neq('creator_id', userId) // Exclude own ideas
      .order('created_at', { ascending: false });

    if (collaboratedIdeasError) {
      throw collaboratedIdeasError;
    }

    // Format the ideas to include commentCount
    const formattedMyIdeas = myIdeas.map(idea => ({
      ...idea,
      commentCount: idea.comments.count || 0
    }));

    const formattedCollaboratedIdeas = collaboratedIdeas.map(idea => ({
      ...idea,
      commentCount: idea.comments.count || 0
    }));

    return NextResponse.json({
      myIdeas: formattedMyIdeas,
      collaboratedIdeas: formattedCollaboratedIdeas
    });
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session.userId;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, isPublished, tags, status } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Check if the user exists in the users table
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      // PGRST116 is the code for "no rows returned"
      throw userCheckError;
    }

    // If user doesn't exist, create them with basic info
    // We'll implement a more robust user creation in a separate API endpoint
    if (!existingUser) {
      // Try to get basic information from auth session
      const { error: createUserError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            display_name: 'User', // Will be updated later
            is_online: true,
            last_active: new Date().toISOString()
          }
        ]);

      if (createUserError) {
        throw createUserError;
      }
    }

    // Now create the idea
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
          tags: tags || []
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ idea: data[0] });
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  const userId = session.userId;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, firstName, lastName, avatarUrl } = await request.json();

    // Update user information
    const { error: updateUserError } = await supabase
      .from('users')
      .update([
        {
          id: userId,
          email: email || '',
          display_name: `${firstName} ${lastName}`.trim() || 'User',
          avatar_url: avatarUrl || ''
        }
      ]);

    if (updateUserError) {
      throw updateUserError;
    }

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
