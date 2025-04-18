"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from "@/components/main-layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, MessageSquare, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

// Define the type for a feature request
interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  upvotes: number;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  commentCount: number;
}

export default function FeatureRequestsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Feature Requests</h1>
            <Button asChild>
              <Link href="/feature-requests/new">Submit New Request</Link>
            </Button>
          </div>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All Requests</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="space-y-4">
              <FeatureRequestList status="active" />
            </TabsContent>
            <TabsContent value="popular" className="space-y-4">
              <FeatureRequestList status="popular" />
            </TabsContent>
            <TabsContent value="completed" className="space-y-4">
              <FeatureRequestList status="completed" />
            </TabsContent>
            <TabsContent value="all" className="space-y-4">
              <FeatureRequestList status="all" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}

function FeatureRequestList({ status }: { status: string }) {
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatureRequests = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/feature-requests?status=${status}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch feature requests: ${response.statusText}`);
        }
        
        const data = await response.json();
        setFeatureRequests(data || []);
      } catch (err) {
        console.error("Error fetching feature requests:", err);
        setError("Failed to load feature requests. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeatureRequests();
  }, [status]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading feature requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (featureRequests.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <h3 className="text-lg font-medium">No feature requests found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {status === "active" 
            ? "There are no active feature requests at this time." 
            : status === "completed" 
              ? "No completed feature requests yet."
              : "No feature requests match the selected criteria."}
        </p>
        <Button asChild className="mt-4">
          <Link href="/feature-requests/new">Submit a Request</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {featureRequests.map((request) => (
        <Card key={request.id} className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-xl">
                  <Link href={`/feature-requests/${request.id}`} className="hover:text-primary">
                    {request.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {request.category} • {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                </CardDescription>
              </div>
              <div className="rounded-full px-2 py-1 text-xs font-medium capitalize" style={{
                backgroundColor: request.status === 'active' ? '#e0f2fe' : 
                                request.status === 'in_progress' ? '#fef3c7' : 
                                request.status === 'completed' ? '#d1fae5' : '#f3f4f6',
                color: request.status === 'active' ? '#0284c7' : 
                      request.status === 'in_progress' ? '#d97706' : 
                      request.status === 'completed' ? '#059669' : '#374151'
              }}>
                {request.status.replace('_', ' ')}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {request.description}
            </p>
          </CardContent>
          <CardFooter className="border-t pt-3 flex justify-between">
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={request.createdBy.avatarUrl} alt={request.createdBy.name} />
                <AvatarFallback>{request.createdBy.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{request.createdBy.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-xs text-muted-foreground">
                <ThumbsUp className="mr-1 h-4 w-4" />
                <span>{request.upvotes}</span>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <MessageSquare className="mr-1 h-4 w-4" />
                <span>{request.commentCount}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
