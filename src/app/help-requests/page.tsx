"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/main-layout";

type HelpRequest = {
  id: string;
  title: string;
  description: string;
  status: "open" | "assigned" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  tags: string[];
  responseCount: number;
};

export default function HelpRequestsPage() {
  const [requests, setRequests] = useState<HelpRequest[]>([
    {
      id: "1",
      title: "Need help implementing search functionality",
      description: "I'm having trouble with the fuzzy search algorithm. Could someone with experience in search implementations help me out?",
      status: "open",
      priority: "medium",
      createdAt: "2025-03-15T10:00:00Z",
      createdBy: {
        id: "user1",
        name: "Jamie Smith",
        avatarUrl: "https://avatars.githubusercontent.com/u/2345678"
      },
      tags: ["search", "algorithm", "typescript"],
      responseCount: 0
    },
    {
      id: "2",
      title: "Authentication flow not working properly",
      description: "Users are sometimes getting logged out unexpectedly. Need help debugging the auth flow.",
      status: "assigned",
      priority: "high",
      createdAt: "2025-03-17T14:30:00Z",
      createdBy: {
        id: "user2",
        name: "Pat Miller",
        avatarUrl: "https://avatars.githubusercontent.com/u/4567890"
      },
      assignedTo: {
        id: "user3",
        name: "Alex Johnson",
        avatarUrl: "https://avatars.githubusercontent.com/u/1234567"
      },
      tags: ["auth", "clerk", "bug"],
      responseCount: 2
    },
    {
      id: "3",
      title: "Mobile responsive design issues",
      description: "Our application isn't displaying correctly on small mobile screens. Need help with responsive design fixes.",
      status: "in_progress",
      priority: "medium",
      createdAt: "2025-03-18T09:15:00Z",
      createdBy: {
        id: "user4",
        name: "Taylor Swift",
        avatarUrl: "https://avatars.githubusercontent.com/u/3456789"
      },
      assignedTo: {
        id: "user5",
        name: "Sam Wilson",
        avatarUrl: "https://avatars.githubusercontent.com/u/5678901"
      },
      tags: ["css", "responsive", "mobile"],
      responseCount: 4
    },
    {
      id: "4",
      title: "Database query optimization needed",
      description: "Our idea listing page is loading very slowly. I suspect it's related to inefficient database queries.",
      status: "resolved",
      priority: "urgent",
      createdAt: "2025-03-10T11:45:00Z",
      createdBy: {
        id: "user3",
        name: "Alex Johnson",
        avatarUrl: "https://avatars.githubusercontent.com/u/1234567"
      },
      assignedTo: {
        id: "user4",
        name: "Taylor Swift",
        avatarUrl: "https://avatars.githubusercontent.com/u/3456789"
      },
      tags: ["database", "supabase", "performance"],
      responseCount: 7
    }
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getPriorityBadge = (priority: HelpRequest["priority"]) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="bg-slate-100">Low</Badge>;
      case "medium":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Medium</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">High</Badge>;
      case "urgent":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Urgent</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: HelpRequest["status"]) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500">Open</Badge>;
      case "assigned":
        return <Badge className="bg-blue-500">Assigned</Badge>;
      case "in_progress":
        return <Badge className="bg-purple-500">In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline" className="text-muted-foreground">Resolved</Badge>;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Help Requests</h1>
            <Button asChild>
              <Link href="/help-requests/new">Request Help</Link>
            </Button>
          </div>
          <Tabs defaultValue="open" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="assigned">Assigned</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="all">All Requests</TabsTrigger>
            </TabsList>
            <TabsContent value="open" className="space-y-4">
              <HelpRequestList 
                requests={requests.filter(r => r.status === "open")} 
                emptyMessage="No open help requests"
              />
            </TabsContent>
            <TabsContent value="assigned" className="space-y-4">
              <HelpRequestList 
                requests={requests.filter(r => r.status === "assigned")} 
                emptyMessage="No assigned help requests"
              />
            </TabsContent>
            <TabsContent value="in_progress" className="space-y-4">
              <HelpRequestList 
                requests={requests.filter(r => r.status === "in_progress")} 
                emptyMessage="No help requests in progress"
              />
            </TabsContent>
            <TabsContent value="resolved" className="space-y-4">
              <HelpRequestList 
                requests={requests.filter(r => r.status === "resolved")} 
                emptyMessage="No resolved help requests"
              />
            </TabsContent>
            <TabsContent value="all" className="space-y-4">
              <HelpRequestList 
                requests={requests} 
                emptyMessage="No help requests found"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );

  function HelpRequestList({ 
    requests, 
    emptyMessage 
  }: { 
    requests: HelpRequest[],
    emptyMessage: string
  }) {
    if (requests.length === 0) {
      return (
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
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <p className="text-center text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4">
        {requests.map(request => (
          <Card key={request.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">
                      <Link href={`/help-requests/${request.id}`} className="hover:underline">
                        {request.title}
                      </Link>
                    </CardTitle>
                    {getStatusBadge(request.status)}
                    {getPriorityBadge(request.priority)}
                  </div>
                  <CardDescription className="mt-1">
                    Requested by {request.createdBy.name} on {formatDate(request.createdAt)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2">{request.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {request.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-3">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1 h-4 w-4 text-muted-foreground"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="text-sm text-muted-foreground">{request.responseCount} responses</span>
                </div>
                {request.assignedTo && (
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-muted-foreground">Assigned to:</span>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-1">
                        <AvatarImage src={request.assignedTo.avatarUrl} alt={request.assignedTo.name} />
                        <AvatarFallback>{request.assignedTo.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{request.assignedTo.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
}
