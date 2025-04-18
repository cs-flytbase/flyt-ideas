"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageSquare, History, ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

// Import components
import { CommentSection, HistoryTab } from './components';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MainLayout } from "@/components/main-layout";

// Define types based on our API responses
interface Comment {
  id: string;
  idea_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
}

interface Assignment {
  id: string;
  idea_id: string;
  user_id: string;
  status: string;
  assigned_at: string;
  user: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
}

// Helper function to get user initials from a name
const getInitials = (name: string): string => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function IdeaPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [idea, setIdea] = useState<any | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUnassigning, setIsUnassigning] = useState(false);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    async function fetchIdea() {
      if (!id) return;
      
      try {
        setLoading(true);
        // Fetch idea details
        const ideaResponse = await fetch(`/api/ideas/${id}`);
        if (!ideaResponse.ok) {
          throw new Error('Failed to fetch idea');
        }
        const ideaData = await ideaResponse.json();
        setIdea(ideaData);

        // Fetch comments for this idea
        const commentsResponse = await fetch(`/api/ideas/${id}/comments`);
        if (!commentsResponse.ok) {
          throw new Error('Failed to fetch comments');
        }
        const commentsData = await commentsResponse.json();
        setComments(commentsData.comments || []);
        
        // Update comment count with actual length
        if (commentsData.comments) {
          setCommentCount(commentsData.comments.length);
        }

        // Fetch assignments for this idea
        const assignmentsResponse = await fetch(`/api/ideas/${id}/assign`);
        if (!assignmentsResponse.ok) {
          throw new Error('Failed to fetch assignments');
        }
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData.assignments || []);

        // Fetch user's vote if they're logged in
        if (isUserLoaded && user) {
          const voteResponse = await fetch(`/api/ideas/${id}/vote`);
          if (voteResponse.ok) {
            const voteData = await voteResponse.json();
            setUserVote(voteData.vote?.vote_type || null);
          }
        }

      } catch (err) {
        console.error("Error fetching idea:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchIdea();
  }, [id, isUserLoaded, user]);

  const handleSubmitComment = async () => {
    if (!id || !newComment.trim() || !isUserLoaded || !user) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/ideas/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim()
        }),
      });
      
      if (response.ok) {
        const newCommentData = await response.json();
        // Add the new comment to the comments array
        setComments(prev => [...prev, newCommentData.comment]);
        // Update comment count
        setCommentCount(prev => prev + 1);
        // Clear the form
        setNewComment('');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePickIdea = async () => {
    if (!user?.id || !id) return;
    
    try {
      setIsAssigning(true);
      const response = await fetch(`/api/ideas/${id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to pick idea');
      }
      
      // Refresh assignments
      const assignmentsResponse = await fetch(`/api/ideas/${id}/assign`);
      const assignmentsData = await assignmentsResponse.json();
      setAssignments(assignmentsData.assignments || []);
      
    } catch (err) {
      console.error("Error picking idea:", err);
    } finally {
      setIsAssigning(false);
    }
  };
  
  const handleUnpickIdea = async () => {
    if (!user?.id || !id) return;
    
    try {
      setIsUnassigning(true);
      const response = await fetch(`/api/ideas/${id}/assign`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unpick idea');
      }
      
      // Refresh assignments
      const assignmentsResponse = await fetch(`/api/ideas/${id}/assign`);
      const assignmentsData = await assignmentsResponse.json();
      setAssignments(assignmentsData.assignments || []);
      
    } catch (err) {
      console.error("Error unpicking idea:", err);
    } finally {
      setIsUnassigning(false);
    }
  };
  
  const handleVote = async (voteType: number) => {
    if (!isUserLoaded || !user) return;

    try {
      setIsVoting(true);
      const response = await fetch(`/api/ideas/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote_type: voteType }),
      });

      if (response.ok) {
        const data = await response.json();
        // If the vote was removed (toggled off)
        if (data.action === 'removed') {
          setUserVote(null);
        } else {
          setUserVote(voteType);
        }
        setIdea({...idea, upvotes: data.upvotes});
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const isUserAssigned = isUserLoaded && user?.id && assignments.some(
    assignment => assignment.user_id === user.id
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 py-6 md:px-6 lg:px-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-6 md:px-6 lg:px-8">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold">Idea Not Found</h2>
          <p className="text-muted-foreground">The requested idea could not be found.</p>
          <Button variant="outline" onClick={() => router.push('/ideas')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ideas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/ideas">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Idea Details</h1>
          </div>
        </div>
        {/* Clean, modern header */}
        <div className="bg-background border-b">
          <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
            <div className="flex items-center mb-6">
              <Button variant="ghost" onClick={() => router.push('/ideas')} className="hover:bg-background/80 rounded-full">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Back to ideas</span>
              </Button>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-start gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                      {idea.title}
                    </h1>
                    <Badge variant="outline" className="ml-2 capitalize">
                      {idea.status || "Open"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Created by</span>
                    <Link href={`/users/${idea.creator_id}`} className="font-medium hover:underline">
                      {idea.users?.display_name || "unknown"}
                    </Link>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}</span>
                    <span>•</span>
                    <span>{idea.upvotes || 0} upvotes</span>
                  </div>
                  
                  <div className="prose max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {idea.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 my-4">
                    {idea.tags && idea.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="rounded-md px-3 py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    {isUserLoaded && user ? (
                      isUserAssigned ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleUnpickIdea}
                          disabled={isUnassigning}
                        >
                          {isUnassigning ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Unassigning...
                            </>
                          ) : (
                            <>Unpick</>
                          )}
                        </Button>
                      ) : (
                        <Button 
                          variant="default"
                          size="sm"
                          onClick={handlePickIdea}
                          disabled={isAssigning}
                        >
                          {isAssigning ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Assigning...
                            </>
                          ) : (
                            <>Pick</>
                          )}
                        </Button>
                      )
                    ) : null}
                    
                    <div className="flex flex-col items-center space-y-1 mx-2">
                      <button 
                        className={`text-foreground/70 hover:text-primary transition-colors ${userVote === 1 ? "text-primary" : ""}`}
                        onClick={() => handleVote(1)}
                        disabled={isVoting}
                      >
                        {isVoting && userVote === 1 ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill={userVote === 1 ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m5 15 7-7 7 7" />
                          </svg>
                        )}
                      </button>
                      
                      <span className={`text-sm font-semibold ${
                        idea.upvotes > 0 ? "text-primary" : (
                          idea.upvotes < 0 ? "text-destructive" : ""
                        )
                      }`}>
                        {idea.upvotes || 0}
                      </span>
                      
                      <button 
                        className={`text-foreground/70 hover:text-destructive transition-colors ${userVote === -1 ? "text-destructive" : ""}`}
                        onClick={() => handleVote(-1)}
                        disabled={isVoting}
                      >
                        {isVoting && userVote === -1 ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill={userVote === -1 ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m19 9-7 7-7-7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
          <Tabs defaultValue="discussion" className="w-full">
            <TabsList className="border-b w-full mb-8">
              <TabsTrigger 
                value="discussion" 
                className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Discussion</span>
                  <span className="text-xs text-muted-foreground">{commentCount}</span>
                </div>
              </TabsTrigger>
              

              
              <TabsTrigger 
                value="team" 
                className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Contributors</span>
                  <span className="text-xs text-muted-foreground">{assignments.length}</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="history" 
                className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            {/* Discussion Tab Content */}
            <TabsContent value="discussion" className="mt-4">
              <div className="bg-card rounded-lg border shadow-sm">
                <CommentSection 
                  comments={comments}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  handleSubmitComment={handleSubmitComment}
                  isSubmitting={isSubmitting}
                  isUserLoaded={isUserLoaded}
                  user={user}
                  getInitials={getInitials}
                />
              </div>
            </TabsContent>


            
            {/* Team Tab Content */}
            <TabsContent value="team" className="mt-4">
              <div className="bg-card rounded-lg border shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Contributors
                </h3>
                
                {assignments.length > 0 ? (
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center gap-3 p-3 border rounded-md bg-background/50">
                        <div className="flex-shrink-0">
                          <Avatar>
                            <AvatarImage src={assignment.user.avatar_url} alt={assignment.user.display_name} />
                            <AvatarFallback>{getInitials(assignment.user.display_name)}</AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <Link href={`/users/${assignment.user.id}`} className="font-medium hover:underline">
                            {assignment.user.display_name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Assigned {formatDistanceToNow(new Date(assignment.assigned_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {assignment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No contributors have picked this idea yet.</p>
                    {isUserLoaded && user && !isUserAssigned && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={handlePickIdea}
                        disabled={isAssigning}
                      >
                        {isAssigning ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Joining team...
                          </>
                        ) : (
                          <>Pick this idea</>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* History Tab Content */}
            <TabsContent value="history" className="mt-4">
              <div className="bg-card rounded-lg border shadow-sm">
                <HistoryTab 
                  assignments={assignments}
                  getInitials={getInitials}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}