import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// POST handler for adding a user as a power user for a tool
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Use headers to get the user ID - simpler approach that works with App Router
  const userId = request.headers.get('x-clerk-user-id');
  const { id: toolId } = await params;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized - No user ID found' }, { status: 401 });
  }
  
  console.log('Processing power user request for:', { userId, toolId });
  
  try {
    // Create a Supabase client with the server-side cookies helper
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // First check if this power user relationship already exists
    const { data: existingPowerUser, error: checkError } = await supabase
      .from('tool_power_users')
      .select('id')
      .eq('tool_id', toolId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking existing power user:', checkError);
      // Continue anyway - we'll try to insert
    }
    
    // If the relationship already exists, just return success
    if (existingPowerUser) {
      console.log('User is already a power user for this tool');
      return NextResponse.json({
        success: true,
        message: 'Already a power user'
      });
    }
    
    // Add the power user record
    const { data: powerUser, error: powerUserError } = await supabase
      .from('tool_power_users')
      .insert({
        tool_id: toolId,
        user_id: userId
      });
    
    if (powerUserError) {
      console.error('Error adding power user:', powerUserError);
      return NextResponse.json({ 
        error: 'Failed to add power user', 
        details: powerUserError 
      }, { status: 500 });
    }
    
    console.log('Successfully added power user');
    return NextResponse.json({
      success: true,
      message: 'Successfully added as power user'
    });
  } catch (error) {
    console.error('Unexpected error in power user API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error
    }, { status: 500 });
  }
}

// DELETE handler for removing a user as a power user for a tool
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Use headers to get the user ID - simpler approach that works with App Router
  const userId = request.headers.get('x-clerk-user-id');
  const { id: toolId } = await params;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized - No user ID found' }, { status: 401 });
  }
  
  console.log('Processing power user removal for:', { userId, toolId });
  
  try {
    // Create a Supabase client with the server-side cookies helper
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Remove user as a power user
    const { error: removeError } = await supabase
      .from('tool_power_users')
      .delete()
      .eq('tool_id', toolId)
      .eq('user_id', userId);
    
    if (removeError) {
      console.error('Error removing power user:', removeError);
      return NextResponse.json({ 
        error: 'Failed to remove power user',
        details: removeError 
      }, { status: 500 });
    }
    
    console.log('Successfully removed power user');
    return NextResponse.json({
      success: true,
      message: 'Successfully removed power user status'
    });
  } catch (error) {
    console.error('Error in remove power user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
