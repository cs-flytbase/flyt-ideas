"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { postsService } from "@/lib/database";
import { MainLayout } from "@/components/main-layout";
import { Toaster } from "@/components/ui/toaster";
import { MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { 
  CommentItem, 
  CommentSection, 
  ContentDisplay, 
  DiscussionHeader, 
  VotingActions 
} from "@/components/discussion";

export default function PostPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<number>(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;

      try {
        setLoading(true);
        // Get the post
        const postData = await postsService.getPost(id);
        setPost(postData);

        // Get comments for this post
        const commentsData = await postsService.getPostComments(id);
        setComments(commentsData);

        // Get user's vote status if logged in
        if (user?.id) {
          try {
            const voteResponse = await fetch(`/api/posts/${id}/user-vote?userId=${user.id}`);
            if (voteResponse.ok) {
              const voteData = await voteResponse.json();
              setUserVote(voteData?.value || 0);
            }
          } catch (error) {
            console.error('Error fetching user vote:', error);
            // Continue even if we can't get the vote status
          }
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Could not load post. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id, user]);
  
  // Handler for submitting a new comment
  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;
    
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          authorId: user.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to post comment');
      }
      
      const newCommentData = await response.json();
      
      // Add the new comment to the list
      setComments([newCommentData, ...comments]);
      setNewComment('');
      setShowCommentBox(false);
      
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post your comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render a comment using the CommentItem component
  const renderComment = (comment: any) => {
    return (
      <CommentItem
        key={comment.id}
        comment={comment}
        currentUser={user}
        type="post"
        parentId={id}
      />
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="px-4 py-6 md:px-6 lg:px-8 flex items-center justify-center min-h-[50vh]">
          <p className="text-center">Loading post...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="px-4 py-6 w-full bg-background">
          <div className="max-w-screen-xl mx-auto bg-white dark:bg-black rounded-md shadow-sm p-6">
            <p className="text-center text-red-500 text-lg">{error || "Post not found"}</p>
            <div className="mt-4 text-center">
              <Link href="/posts">
                <Button>Back to Posts</Button>
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
        {/* Post header with author info, title and tags */}
        <DiscussionHeader
          title={post.title}
          creator={post.creator}
          created_at={post.created_at}
          tags={post.tags}
          backLink="/posts"
          backLinkText="Back to posts"
        />

        {/* Post content */}
        <div className="bg-white dark:bg-black rounded-lg border shadow-sm overflow-hidden">
          <div className="p-3 sm:p-4 md:p-5">
            {/* Post content with improved typography and spacing */}
            <ContentDisplay content={post.content} />
            
            {/* Post actions - voting, comments, share */}
            <VotingActions
              id={post.id}
              upvotes={post.upvotes || 0}
              commentCount={comments.length}
              user={user}
              userVote={userVote}
              type="post"
              onCommentClick={() => setShowCommentBox(true)}
            />
          </div>
        </div>
        
        {/* Comments section */}
        <div className="mt-4 bg-white dark:bg-black rounded-lg border shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-4">
              <h3 className="text-sm font-medium">Comments ({comments.length})</h3>
              
              <Button 
                onClick={() => setShowCommentBox(true)}
                className="rounded-full w-full sm:w-auto border border-muted flex items-center justify-start bg-muted/10 text-muted-foreground text-base sm:text-sm px-4 py-2 sm:px-6 sm:py-2 mb-4 transition-all duration-150"
                aria-label="Add a comment"
              >
                <span className="hidden sm:inline">+ Add a comment</span>
                <span className="sm:hidden w-full text-center">+ Add comment</span>
              </Button>
              <div className="relative w-48 md:w-64">
                <input
                  type="text"
                  placeholder="Search Comments"
                  className="w-full rounded-full py-1 px-3 text-xs bg-muted/20 border border-muted outline-none focus:ring-1 focus:ring-muted pl-8"
                />
                <MessageSquare className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          
            {/* Comment area */}
            {showCommentBox && (
              <div className="p-4 border-b border-muted">
                <Textarea
                  id="comment-textarea"
                  placeholder="What are your thoughts?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={5}
                  disabled={!user}
                  className="border-0 focus-visible:ring-0 resize-none text-base sm:text-sm p-3 sm:p-4 w-full"
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
                    disabled={isSubmitting || !newComment.trim() || !user}
                    className="bg-primary hover:bg-primary/90 text-xs h-7 rounded-full px-4"
                  >
                    {isSubmitting ? "Posting..." : "Comment"}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Comments */}
          {comments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">No comments yet</p>
              <p className="text-xs text-muted-foreground/70">Be the first to share what you think!</p>
            </div>
          ) : (
            <div className="px-4 py-3">
              {comments.map(renderComment)}
              {comments.length > 2 && (
                <Button variant="ghost" className="flex items-center gap-1 text-xs text-primary mt-2 mb-4">
                  <span className="text-primary">2 more replies</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Add the Toaster component to show toasts */}
      <Toaster />
    </MainLayout>
  );
}
