import { NextResponse } from "next/server";
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Await params access
  const resolvedParams = await Promise.resolve(params);
  const requestId = resolvedParams.id;
  
  const session = await auth();
  const userId = session?.userId;
  
  // Check if user is authenticated
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { content } = await request.json();

    // Validate request data
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Check if feature request exists
    const { data: featureRequest, error: featureRequestError } = await supabase
      .from("feature_requests")
      .select("id")
      .eq("id", requestId)
      .single();

    if (featureRequestError || !featureRequest) {
      console.error("Feature request error:", featureRequestError);
      return NextResponse.json(
        { error: "Feature request not found" },
        { status: 404 }
      );
    }

    // Get user data from supabase (profile info)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error("User data error:", userError);
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Insert comment - use feature_request_comments table (not comments)
    const { data: comment, error: commentError } = await supabase
      .from("feature_request_comments")
      .insert({
        feature_request_id: requestId,
        content: content,
        user_id: userData.id,
        created_at: new Date().toISOString() // Explicitly set creation timestamp
      })
      .select()
      .single();

    if (commentError) {
      console.error("Error creating comment:", commentError);
      return NextResponse.json(
        { error: "Failed to create comment: " + commentError.message },
        { status: 500 }
      );
    }

    // Get the user data to include in the response
    const { data: commentUser, error: commentUserError } = await supabase
      .from("users")
      .select("id, display_name, avatar_url")
      .eq("id", userData.id)
      .single();

    if (commentUserError) {
      console.error("Error fetching user for comment:", commentUserError);
    }

    // Format the response to match our frontend expectations
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      user: {
        id: commentUser?.id || userData.id,
        name: commentUser?.display_name || userData.display_name || 'Unknown User',
        avatarUrl: commentUser?.avatar_url || userData.avatar_url || '',
      }
    };

    return NextResponse.json(formattedComment, { status: 201 });
  } catch (error) {
    console.error("Error processing comment:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the comment" + (error instanceof Error ? `: ${error.message}` : '') },
      { status: 500 }
    );
  }
}
