// Import only what we need
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET handler for fetching a specific tool by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Extract id from params in a way that respects Next.js async requirement
  const { id } = await Promise.resolve(params);

  if (!id) {
    return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
  }

  try {
    // Create a Supabase client with the updated cookie handling pattern
    const supabase = await createClient();
    
    // First verify the tool exists
    const { data: toolExists, error: existsError } = await supabase
      .from('tools')
      .select('id')
      .eq('id', id)
      .single();
      
    if (existsError) {
      console.error('Error checking if tool exists:', existsError);
      if (existsError.code === 'PGRST116') { // No rows returned
        return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch tool' }, { status: 500 });
    }
    
    // Now fetch the tool with its power users (without trying to join profiles directly)
    const { data, error } = await supabase
      .from('tools')
      .select(`
        *,
        power_users:tool_power_users(
          id, 
          user_id, 
          created_at
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching tool details:', error);
      return NextResponse.json({ error: 'Failed to fetch tool details' }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    
    // Process power users to get user profiles in a separate query
    if (data.power_users && data.power_users.length > 0) {
      // Extract all user_ids from power_users
      const userIds = data.power_users.map((pu: any) => pu.user_id);
      
      // Fetch user profiles
      const { data: userProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);
      
      if (!profilesError && userProfiles) {
        // Create a map of user_id to profile data for quick lookup
        const profileMap = userProfiles.reduce((acc: any, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});
        
        // Enhance power_users with user profile information
        data.power_users = data.power_users.map((powerUser: any) => ({
          ...powerUser,
          user: profileMap[powerUser.user_id] || null
        }));
      } else {
        console.error('Error fetching user profiles:', profilesError);
      }
    }
    
    // Safely cast the data to any to extract properties
    const toolRaw = data as any;
    
    // Get a clean object to work with
    const toolData = {
      id: toolRaw.id,
      name: toolRaw.name,
      description: toolRaw.description,
      category: toolRaw.category,
      website: toolRaw.website,
      github_url: toolRaw.github_url,
      documentation_url: toolRaw.documentation_url,
      created_at: toolRaw.created_at,
      updated_at: toolRaw.updated_at,
      creator_id: toolRaw.creator_id,
      logo_url: toolRaw.logo_url,
      is_verified: toolRaw.is_verified,
      // Add any other fields that should be included
    };
    
    // Format power users for the response if available
    const formattedPowerUsers = Array.isArray(toolRaw.power_users) 
      ? toolRaw.power_users.map((pu: any) => ({
          id: pu.user_id,
          display_name: pu.users?.display_name || 'Unknown User',
          avatar_url: pu.users?.avatar_url || '',
          expertise_level: pu.expertise_level,
          endorsements: pu.endorsements || 0,
          joined_at: pu.joined_at,
        }))
      : [];
    
    return NextResponse.json({
      ...toolData,
      power_users: formattedPowerUsers,
    });
  } catch (error) {
    console.error('Error in tool detail API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
