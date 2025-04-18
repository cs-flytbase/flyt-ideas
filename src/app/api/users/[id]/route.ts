import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// GET: Fetch user details from Supabase by user ID
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Await the params object
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Get user data from Supabase
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !userData) {
      // If user not found in database, return basic placeholder data
      return NextResponse.json({
        id,
        display_name: 'Anonymous',
        avatar_url: '',
      });
    }
    
    // Return user data
    return NextResponse.json({
      id: userData.id,
      display_name: userData.display_name || 'Anonymous',
      avatar_url: userData.avatar_url || '',
      email: userData.email || '',
      created_at: userData.created_at
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    // Return a basic user object if there's an error
    return NextResponse.json({ 
      id: context.params.id,
      display_name: 'Anonymous',
      avatar_url: '' 
    });
  }
}
