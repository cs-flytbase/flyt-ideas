import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from '@/lib/supabase';

// Handler for GET /api/feature-requests
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  
  try {
    // Build the base query
    let query = supabase
      .from('feature_requests')
      .select(`
        id,
        title,
        description,
        status,
        category,
        upvotes,
        created_at,
        creator_id,
        feature_request_comments(count)
      `);
    
    // Apply status filter if provided
    if (status && status !== "all" && status !== "popular") {
      query = query.eq('status', status);
    }
    
    // Execute the query
    const { data: featureRequests, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching feature requests:", error);
      return NextResponse.json(
        { error: "Failed to fetch feature requests" },
        { status: 500 }
      );
    }
    
    // For popular requests, filter by upvotes
    let filteredRequests = featureRequests || [];
    if (status === "popular") {
      filteredRequests = filteredRequests.filter(request => request.upvotes >= 10);
    }
    
    // Get creator info for each request
    const enrichedRequests = await Promise.all(filteredRequests.map(async (request) => {
      const { data: creatorData, error: creatorError } = await supabase
        .from('users')
        .select('id, display_name, avatar_url')
        .eq('id', request.creator_id)
        .single();
      
      // Handle the count properly
      const commentCount = request.feature_request_comments && 
        Array.isArray(request.feature_request_comments) ? 
        request.feature_request_comments.length : 0;
      
      return {
        id: request.id,
        title: request.title,
        description: request.description,
        status: request.status,
        upvotes: request.upvotes,
        createdAt: request.created_at,
        category: request.category,
        commentCount: commentCount,
        createdBy: creatorData ? {
          id: creatorData.id,
          name: creatorData.display_name || 'Anonymous',
          avatarUrl: creatorData.avatar_url || ''
        } : {
          id: request.creator_id,
          name: 'Anonymous',
          avatarUrl: ''
        }
      };
    }));
    
    return NextResponse.json(enrichedRequests);
  } catch (error) {
    console.error("Error in feature requests API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handler for POST /api/feature-requests
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.userId;
  
  // If user is not authenticated, return error
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  try {
    const data = await request.json();
    
    // Validate request data
    if (!data.title || !data.description || !data.category) {
      return NextResponse.json(
        { error: "Title, description, and category are required" },
        { status: 400 }
      );
    }
    
    // Check if user exists in the users table
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    
    // If user doesn't exist, create a basic profile
    if (userCheckError && userCheckError.code === 'PGRST116') { // No rows found
      const { error: createUserError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            display_name: 'User', // Will be updated later
            is_online: true,
            last_active: new Date().toISOString()
          }
        ]);
      
      if (createUserError) {
        throw createUserError;
      }
    }
    
    // Insert the feature request
    const { data: newFeatureRequest, error } = await supabase
      .from('feature_requests')
      .insert([
        {
          title: data.title,
          description: data.description,
          creator_id: userId,
          status: 'active',
          category: data.category,
          is_public: data.isPublic !== false, // Default to true if not specified
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating feature request:", error);
      return NextResponse.json(
        { error: "Failed to create feature request" },
        { status: 500 }
      );
    }
    
    // Get user info
    const { data: userData } = await supabase
      .from('users')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .single();
    
    // Return the created feature request with additional info
    return NextResponse.json({
      id: newFeatureRequest.id,
      title: newFeatureRequest.title,
      description: newFeatureRequest.description,
      status: newFeatureRequest.status,
      category: newFeatureRequest.category,
      upvotes: 0,
      createdAt: newFeatureRequest.created_at,
      createdBy: {
        id: userId,
        name: userData?.display_name || 'User',
        avatarUrl: userData?.avatar_url || ''
      },
      commentCount: 0
    }, { status: 201 });
  } catch (error) {
    console.error("Error in feature requests API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
