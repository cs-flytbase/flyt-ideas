import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Use the server-side auth pattern consistently
import { auth } from '@clerk/nextjs/server';

// POST handler for adding a user as a power user for a tool
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Use the correct server auth pattern for Next.js App Router
  const authResult = await auth();
  const userId = authResult?.userId;
  const { id: toolId } = await Promise.resolve(params);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get request body but ignore expertise_level as it's not in the schema
    await request.json();
    
    // Create a Supabase client with the server-side cookies helper
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // First check if the user already exists in the profiles table
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError && userError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
      console.error('Error fetching user profile:', userError);
      return NextResponse.json({ error: 'Error fetching user profile' }, { status: 500 });
    }
    
    // Check if the tool exists
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('id')
      .eq('id', toolId)
      .single();
    
    if (toolError) {
      console.error('Error fetching tool:', toolError);
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    // Add user as a power user with updated schema (only tool_id and user_id)
    const { data: powerUser, error: powerUserError } = await supabase
      .from('tool_power_users')
      .insert({
        tool_id: toolId,
        user_id: userId
        // No expertise_level, joined_at or endorsements as they don't exist in the schema
      })
      .select();
    
    if (powerUserError) {
      console.error('Error adding power user:', powerUserError);
      return NextResponse.json({ error: 'Failed to add power user' }, { status: 500 });
    }
    
    // We don't need to update a power_user_count as that would be calculated on demand
    // This was causing errors as the field doesn't exist in the database schema
    
    return NextResponse.json({
      success: true,
      powerUser
    });
  } catch (error) {
    console.error('Error in add power user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE handler for removing a user as a power user for a tool
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Fix auth and properly extract params
  const authResult = await auth();
  const userId = authResult?.userId;
  const { id: toolId } = await Promise.resolve(params);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Create a Supabase client with the server-side cookies helper
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check if the tool exists
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .select('id')
      .eq('id', toolId)
      .single();
    
    if (toolError) {
      console.error('Error fetching tool:', toolError);
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    // Remove user as a power user
    const { error: removeError } = await supabase
      .from('tool_power_users')
      .delete()
      .eq('tool_id', toolId)
      .eq('user_id', userId);
    
    if (removeError) {
      console.error('Error removing power user:', removeError);
      return NextResponse.json({ error: 'Failed to remove power user' }, { status: 500 });
    }
    
    // We don't need to update a power_user_count as that would be calculated on demand
    // This was causing errors as the field doesn't exist in the database schema
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error in remove power user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
