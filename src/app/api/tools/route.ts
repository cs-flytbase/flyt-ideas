import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Type definitions to match our database schema
interface Tool {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
  creator_id: string;
  categories: string[];
  power_users: PowerUser[];
}

interface PowerUser {
  id: string;
  display_name: string;
  avatar_url: string;
}

// GET: Fetch all tools or filter by category
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    // Base query to get all tools
    let toolsQuery = supabase
      .from('tools')
      .select(`
        *
      `)
      .order('usage_count', { ascending: false });
    
    // If category filter is applied
    if (category && category !== 'All') {
      // Get tools associated with the specified category
      const { data: toolIds, error: categoryError } = await supabase
        .from('tool_categories')
        .select('tool_id')
        .eq('category_name', category);
      
      if (categoryError) {
        throw categoryError;
      }
      
      if (toolIds && toolIds.length > 0) {
        // Filter tools by those that match the category
        const ids = toolIds.map(item => item.tool_id);
        toolsQuery = toolsQuery.in('id', ids);
      } else {
        // If no tools match the category, return empty array
        return NextResponse.json([]);
      }
    }
    
    // Execute the query
    const { data: tools, error: toolsError } = await toolsQuery;
    
    if (toolsError) {
      throw toolsError;
    }
    
    // For each tool, get its categories and power users
    const enrichedTools = await Promise.all(tools.map(async (tool) => {
      // Get categories for this tool
      const { data: categories, error: categoriesError } = await supabase
        .from('tool_categories')
        .select('category_name')
        .eq('tool_id', tool.id);
      
      if (categoriesError) {
        console.error(`Error fetching categories for tool ${tool.id}:`, categoriesError);
      }
      
      // Get power users for this tool
      const { data: powerUserIds, error: powerUsersError } = await supabase
        .from('tool_power_users')
        .select('user_id')
        .eq('tool_id', tool.id);
      
      if (powerUsersError) {
        console.error(`Error fetching power user IDs for tool ${tool.id}:`, powerUsersError);
      }
      
      let powerUsers: PowerUser[] = [];
      
      // If we have power users, get their details from users table
      if (powerUserIds && powerUserIds.length > 0) {
        const userIds = powerUserIds.map(item => item.user_id);
        
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, display_name, avatar_url')
          .in('id', userIds);
        
        if (usersError) {
          console.error(`Error fetching user details for tool ${tool.id}:`, usersError);
        } else {
          powerUsers = usersData || [];
        }
      }
      
      // Return the enriched tool object
      return {
        ...tool,
        categories: categories ? categories.map(c => c.category_name) : [],
        power_users: powerUsers
      };
    }));
    
    return NextResponse.json(enrichedTools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}

// POST: Create a new tool
export async function POST(request: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { name, description, icon_name, categories, addAsPowerUser } = await request.json();
    
    // Validate request data
    if (!name) {
      return NextResponse.json({ error: 'Tool name is required' }, { status: 400 });
    }
    
    // Insert the tool
    const { data: tool, error: toolError } = await supabase
      .from('tools')
      .insert([
        {
          name,
          description: description || '',
          icon_name: icon_name || '',
          creator_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (toolError) {
      throw toolError;
    }
    
    // If categories are provided, add them
    if (categories && categories.length > 0) {
      const categoryInserts = categories.map((category: string) => ({
        tool_id: tool.id,
        category_name: category
      }));
      
      const { error: categoriesError } = await supabase
        .from('tool_categories')
        .insert(categoryInserts);
      
      if (categoriesError) {
        console.error('Error inserting categories:', categoriesError);
      }
    }
    
    // Get the user's information to return with the tool
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user data:', userError);
    }
    
    // Add user as power user if requested
    if (addAsPowerUser && userData) {
      const { error: powerUserError } = await supabase
        .from('tool_power_users')
        .insert([
          {
            tool_id: tool.id,
            user_id: userId
          }
        ]);
      
      if (powerUserError) {
        console.error('Error adding power user:', powerUserError);
      }
    }
    
    // Return the created tool with categories and power users
    return NextResponse.json({
      ...tool,
      categories: categories || [],
      power_users: addAsPowerUser && userData ? [userData] : [],
      creator: userData || { display_name: 'Anonymous', avatar_url: '' }
    });
  } catch (error) {
    console.error('Error creating tool:', error);
    return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 });
  }
}
