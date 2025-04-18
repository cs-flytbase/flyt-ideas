import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Fetch user details by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, display_name, avatar_url, email, created_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      // If user not found or error occurred, return fallback
      return NextResponse.json({
        id,
        display_name: 'Anonymous',
        avatar_url: '',
      });
    }

    return NextResponse.json({
      id: user.id,
      display_name: user.display_name || 'Anonymous',
      avatar_url: user.avatar_url || '',
      email: user.email || '',
      created_at: user.created_at || null,
    });
  } catch (error) {
    console.error('Error fetching user details:', error);

    // Return safe fallback response
    return NextResponse.json({
      id: (await params).id,
      display_name: 'Anonymous',
      avatar_url: '',
    });
  }
}
