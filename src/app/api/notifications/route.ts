import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Types for DB row and API response
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

// GET /api/notifications → Get current user's notifications
export async function GET(request: NextRequest): Promise<Response> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data, error } = await supabase
      .from("notifications")
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
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    const formatted: NotificationResponse[] = (data || []).map((item: any) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      content: item.content,
      sourceUrl: item.source_url,
      isRead: item.is_read,
      createdAt: item.created_at,
      sender: item.sender
        ? {
            id: item.sender.id,
            name: item.sender.name,
            avatarUrl: item.sender.avatar_url,
          }
        : undefined,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/notifications → Create a new notification
export async function POST(request: NextRequest): Promise<Response> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { type, title, content, recipientId, sourceUrl, senderId } = body;

    if (!type || !title || !content || !recipientId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        type,
        title,
        content,
        source_url: sourceUrl,
        recipient_id: recipientId,
        sender_id: senderId || userId,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("POST notifications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
