import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET all users endpoint (for the users directory)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // If userId is provided, get a specific user
    if (userId) {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          ideas(
            id,
            title,
            description,
            status,
            upvotes,
            created_at,
            published_at
          )
        `)
        .eq('id', userId)
        .eq('ideas.is_published', true) // Only public ideas
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ user: data });
    }
    
    // Get all users (for directory)
    const { data, error } = await supabase
      .from('users')
      .select('id, display_name, avatar_url, bio, last_active')
      .order('last_active', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ users: data });
  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
