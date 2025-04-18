"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MainLayout } from "@/components/main-layout";
import Link from "next/link";
import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Loader2, ThumbsUp, MessageSquare } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@clerk/nextjs";

// Define the interface for the feature request and its comments
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
  comments: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      avatarUrl: string;
    };
  }[];
}

export default function FeatureRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise using React.use()
  const resolvedParams = use(params);
  const requestId = resolvedParams.id;
  const [featureRequest, setFeatureRequest] = useState<FeatureRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Fetch the feature request details on mount
  useEffect(() => {
    const fetchFeatureRequest = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/feature-requests/${requestId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Feature request not found");
          }
          throw new Error("Failed to load feature request");
        }
        
        const data = await response.json();
        setFeatureRequest(data);
      } catch (error) {
        console.error("Error fetching feature request:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeatureRequest();
  }, [requestId]);

  // Handle posting a new comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      toast({
        title: "Error",
        description: "You must be signed in to post a comment",
        variant: "destructive"
      });
      return;
    }
    
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSubmittingComment(true);
      
      const response = await fetch(`/api/feature-requests/${requestId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: newComment.trim() })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to post comment");
      }
      
      // Get the comment data from the response
      const newCommentData = await response.json();
      
      // Update the UI with the new comment
      if (featureRequest) {
        setFeatureRequest({
          ...featureRequest,
          comments: [...featureRequest.comments, newCommentData]
        });
      }
      
      // Clear the comment input
      setNewComment("");
      
      toast({
        title: "Success",
        description: "Your comment has been posted",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create comment",
        variant: "destructive"
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle upvoting the feature request
  const handleUpvote = async () => {
    if (!isSignedIn) {
      toast({
        title: "Error",
        description: "You must be signed in to upvote",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Call the API to upvote
      const response = await fetch(`/api/feature-requests/${requestId}/upvote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to upvote request");
      }
      
      // Update the UI optimistically
      if (featureRequest) {
        setFeatureRequest({
          ...featureRequest,
          upvotes: featureRequest.upvotes + 1
        });
        
        toast({
          title: "Success",
          description: "Your upvote has been counted",
        });
      }
    } catch (error) {
      console.error("Error upvoting:", error);
      toast({
        title: "Error",
        description: "Failed to upvote. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading feature request...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !featureRequest) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error || "Feature request not found"}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push('/feature-requests')}
            >
              Back to Feature Requests
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/feature-requests">
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
              <span className="ml-1">Back to Requests</span>
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{featureRequest.title}</CardTitle>
                  <CardDescription className="mt-1">
                    Requested by {featureRequest.createdBy.name} • {formatDistanceToNow(new Date(featureRequest.createdAt), { addSuffix: true })}
                  </CardDescription>
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {featureRequest.category}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <Button variant="outline" size="sm" className="h-auto py-1" onClick={handleUpvote}>
                    <ThumbsUp className="mr-1 h-4 w-4" />
                    <span>{featureRequest.upvotes}</span>
                  </Button>
                  <span className="mt-1 text-xs text-muted-foreground">upvotes</span>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <span className={`mr-2 inline-flex h-2 w-2 rounded-full ${
                  featureRequest.status === "completed" 
                    ? "bg-green-500" 
                    : featureRequest.status === "in_progress"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                }`}></span>
                <span className="text-sm text-muted-foreground capitalize">{featureRequest.status.replace('_', ' ')}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{featureRequest.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" size="sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1 h-4 w-4"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                Follow
              </Button>
              <Button variant="secondary" size="sm" onClick={handleUpvote}>
                <ThumbsUp className="mr-1 h-4 w-4" />
                Upvote
              </Button>
            </CardFooter>
          </Card>

          <h2 className="mt-4 text-xl font-bold">Comments ({featureRequest.comments.length})</h2>
          
          <div className="space-y-4">
            {featureRequest.comments.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto h-8 w-8 opacity-50 mb-2" />
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </CardContent>
              </Card>
            ) : (
              featureRequest.comments.map(comment => (
                <Card key={comment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} />
                        <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-2">
                        <div className="font-semibold">{comment.user.name}</div>
                        <CardDescription>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{comment.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Card className="mt-4">
            <form onSubmit={handlePostComment}>
              <CardHeader>
                <CardTitle>Add a Comment</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Share your thoughts on this feature request..." 
                  className="min-h-[100px]" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={!isSignedIn || submittingComment}
                />
                {!isSignedIn && (
                  <p className="mt-2 text-sm text-amber-600">
                    You need to be signed in to post a comment.
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-4">
                <Button type="submit" disabled={!isSignedIn || submittingComment}>
                  {submittingComment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
