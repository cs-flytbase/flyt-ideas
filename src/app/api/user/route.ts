import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const session = await auth();
  const userId = session.userId;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Fetching user profile for:', userId);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Supabase error details:', JSON.stringify(error));
      throw error;
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

export async function POST() {
  const session = await auth();
  const userId = session.userId;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Creating/checking user record for:', userId);
    
    // Check if the user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        console.log('User does not exist, will create new record');
      } else {
        console.error('Error checking for existing user:', JSON.stringify(checkError));
        throw checkError;
      }
    }

    // If user doesn't exist, create a new record
    if (!existingUser) {
      console.log('Creating new user record with ID:', userId);
      
      const { error: createError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            display_name: 'User',
            is_online: true,
            last_active: new Date().toISOString()
          }
        ]);

      if (createError) {
        console.error('Error creating user:', JSON.stringify(createError));
        throw createError;
      }

      return NextResponse.json({ message: 'User created successfully' });
    }

    return NextResponse.json({ message: 'User already exists' });
  } catch (error) {
    console.error('Error in user profile creation:', error);
    return NextResponse.json({ 
      error: 'Failed to create user profile',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  const userId = session.userId;
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Updating user profile for:', userId);
    const body = await request.json();
    console.log('Update payload:', JSON.stringify(body));
    
    const { email, displayName, avatarUrl } = body;

    // Update the user with full profile information
    const { data, error: updateError } = await supabase
      .from('users')
      .update({
        email: email || '',
        display_name: displayName || 'User',
        avatar_url: avatarUrl || '',
        last_active: new Date().toISOString()
      })
      .eq('id', userId)
      .select();

    if (updateError) {
      console.error('Error updating user profile:', JSON.stringify(updateError));
      throw updateError;
    }

    return NextResponse.json({ 
      message: 'User profile updated successfully',
      user: data
    });
  } catch (error) {
    console.error('Error in user profile update:', error);
    return NextResponse.json({ 
      error: 'Failed to update user profile',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
