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
    // Check if feature request exists
    const { data: featureRequest, error: featureRequestError } = await supabase
      .from("feature_requests")
      .select("id, upvotes")
      .eq("id", requestId)
      .single();

    if (featureRequestError || !featureRequest) {
      return NextResponse.json(
        { error: "Feature request not found" },
        { status: 404 }
      );
    }

    // Get user data from supabase (profile info)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Check if user already upvoted this request
    const { data: existingUpvote, error: upvoteCheckError } = await supabase
      .from("upvotes")
      .select("id")
      .eq("feature_request_id", requestId)
      .eq("user_id", userData.id)
      .single();

    if (existingUpvote) {
      return NextResponse.json(
        { error: "You have already upvoted this feature request" },
        { status: 400 }
      );
    }

    // Begin a transaction to ensure data consistency
    // 1. Add upvote record
    const { error: upvoteError } = await supabase
      .from("upvotes")
      .insert({
        feature_request_id: requestId,
        user_id: userData.id,
      });

    if (upvoteError) {
      console.error("Error adding upvote:", upvoteError);
      return NextResponse.json(
        { error: "Failed to register upvote" },
        { status: 500 }
      );
    }

    // 2. Increment the upvotes count in the feature_requests table
    const { data: updatedRequest, error: updateError } = await supabase
      .from("feature_requests")
      .update({ upvotes: (featureRequest.upvotes || 0) + 1 })
      .eq("id", requestId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating upvote count:", updateError);
      return NextResponse.json(
        { error: "Failed to update upvote count" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      upvotes: updatedRequest.upvotes
    });
  } catch (error) {
    console.error("Error processing upvote:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the upvote" },
      { status: 500 }
    );
  }
}
