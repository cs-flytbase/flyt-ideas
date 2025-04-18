import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Fetch tool with power users
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Verify tool exists
    const { data: toolExists, error: toolCheckError } = await supabase
      .from('tools')
      .select('id')
      .eq('id', id)
      .single();

    if (toolCheckError) {
      if (toolCheckError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
      }
      throw toolCheckError;
    }

    // Fetch tool details with power user metadata
    const { data: tool, error: toolFetchError } = await supabase
      .from('tools')
      .select(`
        *,
        power_users:tool_power_users(
          id,
          user_id,
          expertise_level,
          joined_at,
          endorsements
        )
      `)
      .eq('id', id)
      .single();

    if (toolFetchError || !tool) {
      return NextResponse.json({ error: 'Failed to fetch tool details' }, { status: 500 });
    }

    const userIds = tool.power_users?.map((pu: any) => pu.user_id) || [];

    // Fetch user profiles
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    const userMap = (users || []).reduce((acc: Record<string, any>, user: any) => {
      acc[user.id] = user;
      return acc;
    }, {});

    // Format power user output
    const formattedPowerUsers = (tool.power_users || []).map((pu: any) => ({
      id: pu.user_id,
      display_name: userMap[pu.user_id]?.display_name || `User ${pu.user_id.slice(0, 6)}`,
      avatar_url: userMap[pu.user_id]?.avatar_url || null,
      expertise_level: pu.expertise_level,
      endorsements: pu.endorsements || 0,
      joined_at: pu.joined_at,
    }));

    const { power_users, ...toolData } = tool;

    return NextResponse.json({
      ...toolData,
      power_users: formattedPowerUsers,
    });
  } catch (error) {
    console.error('Error in tool GET handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add a power user to a tool
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { user_id, expertise_level } = body;

    if (!user_id || !expertise_level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('tool_power_users')
      .insert({
        tool_id: id,
        user_id,
        expertise_level,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      power_user: data,
    });
  } catch (error) {
    console.error('Error in tool POST handler:', error);
    return NextResponse.json({ error: 'Failed to add power user' }, { status: 500 });
  }
}
