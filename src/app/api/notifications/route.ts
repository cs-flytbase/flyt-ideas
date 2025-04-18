import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// Define types for the notification
interface NotificationDB {
  id: string;
  type: string;
  title: string;
  content: string;
  source_url: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar_url: string;
  };
}

interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  content: string;
  sourceUrl: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatarUrl: string;
  };
}

// Handler for GET /api/notifications
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  // If user is not authenticated, return an error
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  try {
    // Create a new Supabase client with the server-side cookies helper
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Fetch user's notifications from the database
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        type,
        title,
        content,
        source_url,
        is_read,
        created_at,
        sender:sender_id (
          id,
          name:display_name,
          avatar_url
        )
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    // Format the notifications to match our frontend model
    const formattedNotifications = (data || []).map((item: any): NotificationResponse => ({
      id: item.id,
      type: item.type,
      title: item.title,
      content: item.content,
      sourceUrl: item.source_url,
      isRead: item.is_read,
      createdAt: item.created_at,
      sender: item.sender ? {
        id: item.sender.id,
        name: item.sender.name,
        avatarUrl: item.sender.avatar_url
      } : undefined
    }));
    
    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error("Error in notifications API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handler for POST /api/notifications
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  // If user is not authenticated, return an error
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const data = await request.json();
    
    // Create a Supabase client with the server-side cookies helper
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Validate request data
    if (!data.type || !data.title || !data.content || !data.recipientId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // (Removing duplicate supabase client - using the one created above)
    
    // Insert the notification into the database
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        type: data.type,
        title: data.title,
        content: data.content,
        recipient_id: data.recipientId,
        sender_id: data.senderId || userId,
        source_url: data.sourceUrl,
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Error in notifications API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
