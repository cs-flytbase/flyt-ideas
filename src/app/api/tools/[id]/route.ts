import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Fetch tool details with formatted power users
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Check tool existence
    const { data: toolExists, error: checkError } = await supabase
      .from('tools')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
      }
      throw checkError;
    }

    // Fetch tool with power users
    const { data: tool, error: fetchError } = await supabase
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

    if (fetchError || !tool) {
      return NextResponse.json({ error: 'Failed to fetch tool details' }, { status: 500 });
    }

    // Get profile data for power users
    const userIds = tool.power_users?.map((pu: any) => pu.user_id) || [];

    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    const userMap = (users || []).reduce((acc: Record<string, any>, user: any) => {
      acc[user.id] = user;
      return acc;
    }, {});

    const formattedPowerUsers = (tool.power_users || []).map((pu: any) => ({
      id: pu.user_id,
      display_name: userMap[pu.user_id]?.display_name || `User ${pu.user_id.slice(0, 6)}`,
      avatar_url: userMap[pu.user_id]?.avatar_url || null,
      expertise_level: pu.expertise_level,
      endorsements: pu.endorsements || 0,
      joined_at: pu.joined_at,
    }));

    const { power_users, ...cleanedTool } = tool;

    return NextResponse.json({
      ...cleanedTool,
      power_users: formattedPowerUsers,
    });
  } catch (error) {
    console.error('Error in GET /power-users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add a power user to a tool
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
  }

  try {
    const { user_id, expertise_level } = await request.json();

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
    console.error('Error in POST /power-users:', error);
    return NextResponse.json({ error: 'Failed to add power user' }, { status: 500 });
  }
}
