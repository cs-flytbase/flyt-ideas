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
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";

// Import components
import { HistoryTab } from './components';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MainLayout } from "@/components/main-layout";
import { 
  CommentItem, 
  ContentDisplay, 
  DiscussionHeader, 
  VotingActions 
} from "@/components/discussion";

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
  const params = useParams();
  const id = params?.id as string;
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
  const [relatedIdeas, setRelatedIdeas] = useState<any[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("discussion");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <MainLayout>
        <div className="px-4 py-6 md:px-6 lg:px-8 flex items-center justify-center min-h-[50vh]">
          <p className="text-center">Loading idea...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !idea) {
    return (
      <MainLayout>
        <div className="px-4 py-6 w-full bg-background">
          <div className="max-w-screen-xl mx-auto bg-white dark:bg-black rounded-md shadow-sm p-6">
            <p className="text-center text-red-500 text-lg">{error || "Idea not found"}</p>
            <div className="mt-4 text-center">
              <Link href="/ideas">
                <Button>Back to Ideas</Button>
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5 w-full bg-background max-w-7xl mx-auto">
        {/* Idea header with author info, title and tags */}
        <DiscussionHeader
          title={idea.title}
          creator={idea.users}
          created_at={idea.created_at}
          tags={idea.tags || []}
          backLink="/ideas"
          backLinkText="Back to ideas"
        />

        {/* Idea content */}
        <div className="bg-white dark:bg-black rounded-lg border shadow-sm overflow-hidden">
          <div className="p-3 sm:p-4 md:p-5">
            {/* Idea content with improved typography and spacing */}
            <ContentDisplay content={idea.description} />
            
            <div className="flex flex-wrap items-center justify-between mt-4 pt-3 border-t">
              {/* Voting controls */}
              <div className="flex items-center gap-2">
                <VotingActions
                  id={idea.id}
                  upvotes={idea.upvotes || 0}
                  commentCount={commentCount}
                  user={user}
                  userVote={userVote || 0}
                  type="idea"
                  onCommentClick={() => setShowCommentBox(true)}
                />
                
                <Badge variant="outline" className="capitalize ml-2">
                  {idea.status || "Open"}
                </Badge>
              </div>

              {/* Idea assignment button */}
              {isUserLoaded && user && (
                <div>
                  {isUserAssigned ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleUnpickIdea}
                      disabled={isUnassigning}
                      className="h-8 px-3 text-xs sm:text-sm"
                    >
                      {isUnassigning ? (
                        <>
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          <span className="sm:hidden">Unpick</span>
                          <span className="hidden sm:inline">Unassigning...</span>
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
                      className="h-8 px-3 text-xs sm:text-sm"
                    >
                      {isAssigning ? (
                        <>
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          <span className="sm:hidden">Pick</span>
                          <span className="hidden sm:inline">Assigning...</span>
                        </>
                      ) : (
                        <>Pick</>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Tabs for Discussion, Team and History */}
        <div className="mt-5">
          <Tabs defaultValue="discussion" className="w-full">
            <TabsList className="border-b w-full mb-4 overflow-x-auto flex flex-nowrap">
              <TabsTrigger 
                value="discussion" 
                className="px-3 sm:px-4 py-1.5 sm:py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary text-xs sm:text-sm whitespace-nowrap"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Discussion</span>
                  <span className="text-xs text-muted-foreground">{commentCount}</span>
                </div>
              </TabsTrigger>

              <TabsTrigger 
                value="team" 
                className="px-3 sm:px-4 py-1.5 sm:py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary text-xs sm:text-sm whitespace-nowrap"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Contributors</span>
                  <span className="text-xs text-muted-foreground">{assignments.length}</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="history" 
                className="px-3 sm:px-4 py-1.5 sm:py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary text-xs sm:text-sm whitespace-nowrap"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <History className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>History</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            {/* Discussion Tab Content */}
            <TabsContent value="discussion" className="mt-4">
              <div className="bg-white dark:bg-black rounded-lg border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Comments
                  </h3>
                  
                  <Button 
                    onClick={() => setShowCommentBox(true)}
                    className="rounded-full w-full sm:w-auto border border-muted flex items-center justify-start bg-muted/10 text-muted-foreground text-base sm:text-sm px-4 py-2 sm:px-6 sm:py-2 transition-all duration-150"
                    aria-label="Add a comment"
                  >
                    <span className="hidden sm:inline">+ Add a comment</span>
                    <span className="sm:hidden w-full text-center">+ Add comment</span>
                  </Button>
                </div>
                
                {/* Comment input area */}
                {showCommentBox && (
                  <div className="mb-6 border rounded-md p-3">
                    <Textarea
                      id="comment-textarea"
                      placeholder="What are your thoughts?"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={5}
                      disabled={!isUserLoaded || !user}
                      className="border-0 focus-visible:ring-0 resize-none text-sm p-3"
                      autoFocus
                    />
                    <div className="flex justify-between mt-2">
                      <Button
                        variant="ghost"
                        onClick={() => setShowCommentBox(false)}
                        className="text-xs h-7"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmitComment} 
                        disabled={isSubmitting || !newComment.trim() || !isUserLoaded || !user}
                        className="bg-primary hover:bg-primary/90 text-xs h-7 rounded-full px-4"
                      >
                        {isSubmitting ? "Posting..." : "Comment"}
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Comments list */}
                {comments.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground text-sm">No comments yet</p>
                    <p className="text-xs text-muted-foreground/70">Be the first to share what you think!</p>
                  </div>
                ) : (
                  <div>
                    {comments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={{
                          ...comment,
                          author: comment.user
                        }}
                        currentUser={user}
                        type="idea"
                        parentId={id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Team Tab Content */}
            <TabsContent value="team" className="mt-4">
              <div className="bg-white dark:bg-black rounded-lg border shadow-sm p-6">
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
                          <div className="font-medium">{assignment.user.display_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Joined {formatDistanceToNow(new Date(assignment.assigned_at), { addSuffix: true })}
                          </div>
                        </div>
                        {/* If current user is this person, show option to leave */}
                        {user?.id === assignment.user_id && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="ml-auto text-xs hover:bg-destructive hover:text-destructive-foreground"
                            onClick={handleUnpickIdea}
                            disabled={isUnassigning}
                          >
                            {isUnassigning ? "Leaving..." : "Leave"}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No contributors yet. Be the first one to pick this idea!</p>
                    
                    {isUserLoaded && user && !isUserAssigned && (
                      <Button 
                        onClick={handlePickIdea} 
                        disabled={isAssigning} 
                        className="mt-4"
                      >
                        {isAssigning ? "Assigning..." : "Pick this idea"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* History Tab Content */}
            <TabsContent value="history" className="mt-4">
              <div className="bg-white dark:bg-black rounded-lg border shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <History className="mr-2 h-5 w-5" />
                  Idea History
                </h3>
                
                <HistoryTab assignments={assignments} getInitials={getInitials} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Add the Toaster component to show toasts */}
      <Toaster />
    </MainLayout>
  );
}