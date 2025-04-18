import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
  }

  try {
    const supabase = createClient();

    // Confirm tool exists
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

    // Fetch tool with power_users (not profiles yet)
    const { data: tool, error: toolFetchError } = await supabase
      .from('tools')
      .select(`
        *,
        power_users:tool_power_users(id, user_id, expertise_level, joined_at, endorsements)
      `)
      .eq('id', id)
      .single();

    if (toolFetchError || !tool) {
      return NextResponse.json({ error: 'Failed to fetch tool details' }, { status: 500 });
    }

    // If tool has power users, fetch user info
    const userIds = tool.power_users?.map((pu: any) => pu.user_id) || [];

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .in('id', userIds);

    const userMap = (users || []).reduce((acc: any, user: any) => {
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

    const {
      power_users, // omit raw field
      ...toolData
    } = tool;

    return NextResponse.json({
      ...toolData,
      power_users: formattedPowerUsers,
    });
  } catch (error) {
    console.error('Error in tool GET handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
