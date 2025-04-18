"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/main-layout";

type Notification = {
  id: string;
  type: "comment" | "mention" | "upvote" | "assignment" | "help_request";
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
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // Replace with actual API call in production
        // const response = await fetch('/api/notifications');
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockNotifications: Notification[] = [
          {
            id: "1",
            type: "comment",
            title: "New comment on your idea",
            content: "Alex Johnson commented on your 'Dark Mode Support' idea: 'This would be great for accessibility and night-time usage. Have you considered also adding a high contrast mode?'",
            sourceUrl: "/ideas/1",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
            sender: {
              id: "user1",
              name: "Alex Johnson",
              avatarUrl: "https://avatars.githubusercontent.com/u/1234567",
            },
          },
          {
            id: "2",
            type: "upvote",
            title: "Your post was upvoted",
            content: "Your post 'Next.js 14 Features' received 5 new upvotes",
            sourceUrl: "/posts/2",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
          },
          {
            id: "3",
            type: "help_request",
            title: "Help request assigned to you",
            content: "Jamie Smith requested your help with implementing the search feature: 'I'm having trouble with the fuzzy search algorithm. Could you take a look?'",
            sourceUrl: "/help-requests/3",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            sender: {
              id: "user2",
              name: "Jamie Smith",
              avatarUrl: "https://avatars.githubusercontent.com/u/2345678",
            },
          },
          {
            id: "4",
            type: "assignment",
            title: "Task assigned to you",
            content: "You were assigned a task: 'Create API documentation' in the project 'Backend Overhaul'",
            sourceUrl: "/ideas/2/checklists",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
            sender: {
              id: "user3",
              name: "Taylor Swift",
              avatarUrl: "https://avatars.githubusercontent.com/u/3456789",
            },
          },
          {
            id: "5",
            type: "mention",
            title: "You were mentioned in a comment",
            content: "Pat Miller mentioned you in a comment: '@currentuser can you explain how the authentication flow works?'",
            sourceUrl: "/ideas/3/comments",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
            sender: {
              id: "user4",
              name: "Pat Miller",
              avatarUrl: "https://avatars.githubusercontent.com/u/4567890",
            },
          },
          {
            id: "6",
            type: "comment",
            title: "New comment on your feature request",
            content: "Sam Wilson commented on your 'Dark Mode Support' feature request: 'Would this also apply to the mobile view?'",
            sourceUrl: "/feature-requests/1",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
            sender: {
              id: "user5",
              name: "Sam Wilson",
              avatarUrl: "https://avatars.githubusercontent.com/u/5678901",
            },
          },
        ];
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Replace with actual API call in production
      // await fetch('/api/notifications/read-all', { method: 'POST' });
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Filter notifications based on the active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.isRead;
    return notification.type === activeTab;
  });

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'comment':
        return (
          <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        );
      case 'upvote':
        return (
          <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </div>
        );
      case 'help_request':
        return (
          <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-600"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
        );
      case 'assignment':
        return (
          <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-600"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <path d="m9 16 2 2 4-4"></path>
            </svg>
          </div>
        );
      case 'mention':
        return (
          <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-indigo-600"
            >
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"></path>
            </svg>
          </div>
        );
      default:
        return (
          <div className="mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
        );
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHour < 24) return `${diffHour} hours ago`;
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <Tabs 
            defaultValue="all" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1">
                    {notifications.filter(n => !n.isRead).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="comment">Comments</TabsTrigger>
              <TabsTrigger value="mention">Mentions</TabsTrigger>
              <TabsTrigger value="help_request">Help Requests</TabsTrigger>
            </TabsList>
          </Tabs>

          {notifications.some(n => !n.isRead) && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-4 text-muted-foreground"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <h2 className="mb-2 text-xl font-semibold">No notifications</h2>
              <p className="text-center text-muted-foreground">
                {activeTab === "all"
                  ? "You don't have any notifications yet."
                  : activeTab === "unread"
                  ? "You don't have any unread notifications."
                  : `You don't have any ${activeTab} notifications.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Link key={notification.id} href={notification.sourceUrl} passHref>
                <div 
                  className={`flex cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  {getTypeIcon(notification.type)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.content}</p>
                    {notification.sender && (
                      <div className="flex items-center pt-2">
                        <Avatar className="mr-2 h-6 w-6">
                          <AvatarImage src={notification.sender.avatarUrl} alt={notification.sender.name} />
                          <AvatarFallback>{notification.sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{notification.sender.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
