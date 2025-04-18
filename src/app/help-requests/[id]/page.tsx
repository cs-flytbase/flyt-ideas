"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MainLayout } from "@/components/main-layout";

export default function HelpRequestDetailPage({ params }: { params: { id: string } }) {
  const [newResponse, setNewResponse] = useState("");
  const [currentStatus, setCurrentStatus] = useState<"open" | "assigned" | "in_progress" | "resolved">("assigned");
  
  // This would be replaced with actual data fetching from an API
  const helpRequest = {
    id: params.id,
    title: "Authentication flow not working properly",
    description: "We're experiencing issues with our authentication flow where users are sometimes getting logged out unexpectedly. I've verified that the tokens are being set correctly but something is causing them to expire or become invalid sooner than they should.\n\nSteps to reproduce:\n1. Login to the application\n2. Navigate between pages for about 5 minutes\n3. Attempt to access a protected route\n\nExpected behavior: User stays logged in\nActual behavior: User is sometimes redirected to login\n\nAny help debugging this would be much appreciated!",
    status: currentStatus, 
    priority: "high" as const,
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
    responses: [
      {
        id: "response1",
        content: "I've seen this issue before. Have you checked the token expiration settings in your Clerk dashboard? Sometimes the default is set too low for active development.",
        createdAt: "2025-03-17T15:45:00Z",
        user: {
          id: "user3",
          name: "Alex Johnson",
          avatarUrl: "https://avatars.githubusercontent.com/u/1234567"
        }
      },
      {
        id: "response2",
        content: "Thanks Alex, I checked the settings and they seem reasonable (1 hour expiration). Could there be an issue with the token refresh mechanism?",
        createdAt: "2025-03-17T16:30:00Z",
        user: {
          id: "user2",
          name: "Pat Miller",
          avatarUrl: "https://avatars.githubusercontent.com/u/4567890"
        }
      }
    ]
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const getPriorityBadge = (priority: "low" | "medium" | "high" | "urgent") => {
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

  const getStatusBadge = (status: "open" | "assigned" | "in_progress" | "resolved") => {
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

  const handleStatusChange = (value: string) => {
    setCurrentStatus(value as "open" | "assigned" | "in_progress" | "resolved");
    // In a real implementation, you would make an API call here to update the status
  };

  const handleSubmitResponse = () => {
    // In a real implementation, you would submit this to an API
    console.log("Submitting response:", newResponse);
    setNewResponse("");
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/help-requests">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="ml-1">Back to Help Requests</span>
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-2xl">{helpRequest.title}</CardTitle>
                    {getStatusBadge(helpRequest.status)}
                    {getPriorityBadge(helpRequest.priority)}
                  </div>
                  <CardDescription className="mt-2">
                    Requested by {helpRequest.createdBy.name} on {formatDate(helpRequest.createdAt)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={helpRequest.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {helpRequest.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar className="mt-0.5 h-10 w-10">
                    <AvatarImage src={helpRequest.createdBy.avatarUrl} alt={helpRequest.createdBy.name} />
                    <AvatarFallback>{helpRequest.createdBy.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{helpRequest.createdBy.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(helpRequest.createdAt)}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-line">{helpRequest.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            {helpRequest.assignedTo && (
              <CardFooter className="border-t border-b-0 bg-muted/50">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-2 text-sm">Assigned to:</span>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={helpRequest.assignedTo.avatarUrl} alt={helpRequest.assignedTo.name} />
                        <AvatarFallback>{helpRequest.assignedTo.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{helpRequest.assignedTo.name}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Reassign</Button>
                </div>
              </CardFooter>
            )}
          </Card>

          <h2 className="mt-2 text-xl font-bold">Responses ({helpRequest.responses.length})</h2>
          
          <div className="space-y-4">
            {helpRequest.responses.map(response => (
              <Card key={response.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={response.user.avatarUrl} alt={response.user.name} />
                      <AvatarFallback>{response.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-2">
                      <div className="font-semibold">{response.user.name}</div>
                      <CardDescription>{formatDate(response.createdAt)}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{response.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Add a Response</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Share your solution or ask for more details..." 
                className="min-h-[120px]" 
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button onClick={handleSubmitResponse}>Submit Response</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
