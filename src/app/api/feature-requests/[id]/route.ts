import { NextResponse } from "next/server";
import { supabase } from '@/lib/supabase';
import { auth } from "@clerk/nextjs/server";

// Handler for GET /api/feature-requests/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Await params access
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
  try {
    // Fetch the feature request with the given id
    const { data: featureRequest, error } = await supabase
      .from('feature_requests')
      .select(`
        id,
        title,
        description,
        status,
        category,
        upvotes,
        created_at,
        creator_id
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching feature request:", error);
      return NextResponse.json(
        { error: "Feature request not found" },
        { status: 404 }
      );
    }
    
    // Fetch the creator information
    const { data: creatorData } = await supabase
      .from('users')
      .select('id, display_name, avatar_url')
      .eq('id', featureRequest.creator_id)
      .single();
    
    // Fetch comments for this feature request
    const { data: commentsData } = await supabase
      .from('feature_request_comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        users:user_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('feature_request_id', id)
      .order('created_at', { ascending: true });
    
    // Format the response
    const formattedResponse = {
      id: featureRequest.id,
      title: featureRequest.title,
      description: featureRequest.description,
      status: featureRequest.status,
      category: featureRequest.category,
      upvotes: featureRequest.upvotes,
      createdAt: featureRequest.created_at,
      createdBy: creatorData ? {
        id: creatorData.id,
        name: creatorData.display_name || 'Anonymous',
        avatarUrl: creatorData.avatar_url || ''
      } : {
        id: featureRequest.creator_id,
        name: 'Anonymous',
        avatarUrl: ''
      },
      comments: commentsData ? commentsData.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        user: comment.users ? {
          id: comment.users.id,
          name: comment.users.display_name || 'Anonymous',
          avatarUrl: comment.users.avatar_url || ''
        } : {
          id: comment.user_id,
          name: 'Anonymous',
          avatarUrl: ''
        }
      })) : []
    };
    
    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error("Error in feature request details API:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature request details" },
      { status: 500 }
    );
  }
}

// Handler for POST /api/feature-requests/[id] - For adding comments
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Await params access
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
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
    const { content } = await request.json();
    
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }
    
    // Check if the feature request exists
    const { data: featureRequest, error: featureRequestError } = await supabase
      .from('feature_requests')
      .select('id')
      .eq('id', id)
      .single();
    
    if (featureRequestError) {
      return NextResponse.json(
        { error: "Feature request not found" },
        { status: 404 }
      );
    }
    
    // Add the comment
    const { data: newComment, error } = await supabase
      .from('feature_request_comments')
      .insert({
        feature_request_id: id,
        user_id: userId,
        content: content.trim()
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Get user data for the comment response
    const { data: userData } = await supabase
      .from('users')
      .select('display_name, avatar_url')
      .eq('id', userId)
      .single();
    
    // Format the response
    const commentResponse = {
      id: newComment.id,
      content: newComment.content,
      createdAt: newComment.created_at,
      user: {
        id: userId,
        name: userData?.display_name || 'User',
        avatarUrl: userData?.avatar_url || ''
      }
    };
    
    // Create a notification for the feature request creator (if creator is not the commenter)
    if (featureRequest.creator_id !== userId) {
      await supabase
        .from('notifications')
        .insert({
          type: 'comment',
          title: 'New comment on your feature request',
          content: `Someone commented on your "${featureRequest.title}" feature request`,
          recipient_id: featureRequest.creator_id,
          sender_id: userId,
          source_url: `/feature-requests/${id}`,
          is_read: false
        });
    }
    
    return NextResponse.json(commentResponse, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

// Handler for PATCH /api/feature-requests/[id] - For updating status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Await params access
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  
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
    
    // Check if the feature request exists and user is authorized to update it
    const { data: featureRequest, error: featureRequestError } = await supabase
      .from('feature_requests')
      .select('id, creator_id, title')
      .eq('id', id)
      .single();
    
    if (featureRequestError) {
      return NextResponse.json(
        { error: "Feature request not found" },
        { status: 404 }
      );
    }
    
    // For now, we'll allow the creator to update the feature request
    // In a more complex system, you might check for admin privileges too
    if (featureRequest.creator_id !== userId) {
      return NextResponse.json(
        { error: "You are not authorized to update this feature request" },
        { status: 403 }
      );
    }
    
    // Update the feature request
    const { data: updatedFeatureRequest, error } = await supabase
      .from('feature_requests')
      .update({
        status: data.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      id: updatedFeatureRequest.id,
      status: updatedFeatureRequest.status,
      updatedAt: updatedFeatureRequest.updated_at
    });
  } catch (error) {
    console.error("Error updating feature request:", error);
    return NextResponse.json(
      { error: "Failed to update feature request" },
      { status: 500 }
    );
  }
}
