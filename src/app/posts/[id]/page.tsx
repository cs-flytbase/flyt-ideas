"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, ArrowDown, ArrowUp, BookmarkIcon, Loader2, MessageSquare, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postsService } from "@/lib/database";
import { MainLayout } from "@/components/main-layout";
import { Toaster } from "@/components/ui/toaster";

export default function PostPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<number | undefined>(undefined);
  const [isVoting, setIsVoting] = useState<boolean>(false);

  // Handle post voting
  const handleVote = async (voteType: number) => {
    if (!user || !post || isVoting) return;

    try {
      setIsVoting(true);
      
      // If user is clicking the same vote button they already selected, remove the vote
      const newVoteValue = userVote === voteType ? 0 : voteType;
      
      // Call the API to update the vote
      const response = await fetch(`/api/posts/${post.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote_type: newVoteValue }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the post's upvotes count
        setPost({ ...post, upvotes: data.upvotes });
        setUserVote(newVoteValue); // 0 means no vote, 1 means upvote, -1 means downvote
        
        // Show toast notification
        if (newVoteValue === 0) {
          toast({
            title: "Vote removed",
            description: "Your vote has been removed",
            duration: 3000,
          });
        } else {
          toast({
            title: newVoteValue === 1 ? "Upvoted" : "Downvoted",
            description: `You ${newVoteValue === 1 ? 'upvoted' : 'downvoted'} this post`,
            duration: 3000,
          });
        }
      } else {
        throw new Error('Failed to register vote');
      }
    } catch (err) {
      console.error('Error voting on post:', err);
      toast({
        title: "Error",
        description: "Failed to register your vote. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsVoting(false);
    }
  };

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;

      try {
        setLoading(true);
        // Get the post
        const postData = await postsService.getPost(id as string);
        setPost(postData);

        // Get comments for this post
        const commentsData = await postsService.getPostComments(id as string);
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

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user?.id) return;

    try {
      setIsSubmitting(true);
      await postsService.addPostComment(id as string, newComment, user.id);
      
      // Refresh comments after adding a new one
      const commentsData = await postsService.getPostComments(id as string);
      setComments(commentsData);
      
      setNewComment("");
      setShowCommentBox(false); // Hide comment box after successful submission
      
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error submitting comment:", err);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!user?.id) return;
    
    // Use toast instead of confirm dialog
    try {
      setIsDeletingComment(true);
      await postsService.deletePostComment(commentId, user.id);
      
      // Refresh comments after deleting one
      const commentsData = await postsService.getPostComments(id as string);
      setComments(commentsData);
      
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed successfully",
        variant: "default",
      });
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingComment(false);
    }
  };

  const renderComment = (comment: any) => {
    const isUserComment = user?.id === comment.user_id;
    const timeAgo = getTimeAgo(new Date(comment.created_at));
    const voteCount = Math.floor(Math.random() * 200); // Random vote count for demo purposes
    
    return (
      <div key={comment.id} className="py-2">
        {/* Comment header */}
        <div className="flex items-center gap-2 mb-1">
          <Avatar className="h-6 w-6">
            <AvatarImage src={comment.author?.avatar_url} />
            <AvatarFallback className="bg-orange-500 text-[10px] text-white">{comment.author?.display_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Link
            href={`/users/${comment.user_id}`}
            className="font-medium text-xs hover:underline"
          >
            {comment.author?.display_name}
          </Link>
          <span className="text-xs text-muted-foreground">• {timeAgo}</span>
        </div>
        
        {/* Comment content */}
        <div className="text-sm mb-2 pl-8">{comment.content}</div>
        
        {/* Comment actions */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground pl-8">
          <button className="flex items-center px-1 py-0.5 hover:bg-muted/30 rounded-sm" title="Upvote">
            <ArrowUp className="h-4 w-4" />
          </button>
          
          <span className="text-xs font-medium mx-1">{voteCount}</span>
          
          <button className="flex items-center px-1 py-0.5 hover:bg-muted/30 rounded-sm" title="Downvote">
            <ArrowDown className="h-4 w-4" />
          </button>
          
          <button className="ml-2 hover:bg-muted/30 px-2 py-0.5 rounded-sm">
            Reply
          </button>
          
          <button className="hover:bg-muted/30 px-2 py-0.5 rounded-sm">
            Award
          </button>
          
          <button className="hover:bg-muted/30 px-2 py-0.5 rounded-sm">
            Share
          </button>
          
          {isUserComment && (
            <button 
              className="hover:bg-muted/30 px-2 py-0.5 rounded-sm text-destructive/80"
              onClick={() => handleDeleteComment(comment.id)}
              disabled={isDeletingComment}
            >
              Delete
            </button>
          )}
          
          <div className="flex-1"></div>
          
          <button className="hover:bg-muted/30 px-2 py-0.5 rounded-sm hidden md:block">
            Report
          </button>
          
          <button className="hover:bg-muted/30 px-2 py-0.5 rounded-sm hidden md:block">
            Save
          </button>
          
          <button className="hover:bg-muted/30 px-2 py-0.5 rounded-sm md:hidden">
            •••
          </button>
        </div>
      </div>
    );
  };
  
  // Helper function to show time ago (like '1d ago', '23h ago', etc.)
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay}d ago`;
    } else if (diffHour > 0) {
      return `${diffHour}h ago`;
    } else if (diffMin > 0) {
      return `${diffMin}m ago`;
    } else {
      return 'just now';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
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
      <div className="px-4 py-2 w-full bg-background">
        {/* Empty space where the back button used to be */}
        
        {/* Reddit-like post layout - Full width container */}
        <div className="max-w-screen-xl mx-auto bg-white dark:bg-black rounded-md shadow-sm mb-3">
          <div className="flex items-start gap-2 p-2 md:p-3">
            {/* Left back button */}
            <div className="flex flex-col items-center pt-1">
              <Link
                href="/posts"
                className="bg-muted/80 rounded-full p-2 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </div>
            
            {/* Main post content */}
            <div className="flex-1 min-w-0">
              {/* Post header */}
              <div className="text-xs text-muted-foreground mb-2">
                <div className="flex items-center flex-wrap gap-1">
                  <Link href={`/users/${post.creator_id}`} className="text-xs font-medium text-black dark:text-white hover:underline">
                    r/{post.creator?.display_name}
                  </Link>
                  <span>•</span>
                  <span>Posted by</span>
                  <Link href={`/users/${post.creator_id}`} className="hover:underline">
                    u/{post.creator?.display_name}
                  </Link>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Post title */}
              <h1 className="text-xl font-medium mb-2">{post.title}</h1>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {post.tags && post.tags.map((tag: string, i: number) => (
                  <span key={i} className="text-xs px-2 py-1 bg-muted rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Post content with preserved newlines */}
              <div className="text-sm mb-3 whitespace-pre-line">
                {post.content}
              </div>
              
              {/* Post actions - Reddit style */}
              <div className="flex items-center gap-2 mt-4 mb-3">
                <div className="flex items-center bg-muted/50 rounded-full py-1 px-3">
                  <button
                    onClick={() => user && handleVote(1)}
                    disabled={isVoting}
                    className="flex items-center"
                  >
                    {isVoting && userVote === 1 ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <ArrowUp className={`h-4 w-4 mr-1 ${userVote === 1 ? 'text-orange-500' : ''}`} />
                    )}
                  </button>
                  <span className="text-xs font-medium">{post.upvotes || 0}</span>
                  <div className="mx-2 h-4 border-r border-muted"></div>
                  <button
                    onClick={() => user && handleVote(-1)}
                    disabled={isVoting}
                    className="flex items-center"
                  >
                    {isVoting && userVote === -1 ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowDown className={`h-4 w-4 ${userVote === -1 ? 'text-blue-500' : ''}`} />
                    )}
                  </button>
                </div>
                
                <button className="flex items-center gap-1 bg-muted/50 rounded-full py-1 px-3">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs font-medium">{comments.length}</span>
                </button>
                
                <button className="flex items-center gap-1 bg-muted/50 rounded-full py-1 px-3">
                  <Share2 className="h-4 w-4" />
                  <span className="text-xs font-medium">Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Comments section - Reddit style */}
        <div className="max-w-screen-xl mx-auto bg-white dark:bg-black rounded-md mt-4">
          <div className="p-3 border-b border-muted flex flex-col gap-4">
            {/* Add a comment button */}
            <Button 
              variant="outline"
              className="rounded-full w-full md:w-auto border border-muted flex items-center justify-start bg-muted/10 text-muted-foreground"
              onClick={() => setShowCommentBox(true)}
            >
              <span className="ml-2">Add a comment</span>
            </Button>
            
            {/* Sort and search */}
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span>Sort by:</span>
                <Button variant="ghost" className="text-xs h-6 px-2 py-0 flex items-center gap-1">
                  Best <ArrowDown className="h-3 w-3 ml-1" />
                </Button>
              </div>
              
              <div className="relative w-48 md:w-64">
                <input
                  type="text"
                  placeholder="Search Comments"
                  className="w-full rounded-full py-1 px-3 text-xs bg-muted/20 border border-muted outline-none focus:ring-1 focus:ring-muted pl-8"
                />
                <MessageSquare className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
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
                  disabled={isSubmitting || !newComment.trim() || !user}
                  className="bg-primary hover:bg-primary/90 text-xs h-7 rounded-full px-4"
                >
                  {isSubmitting ? "Posting..." : "Comment"}
                </Button>
              </div>
            </div>
          )}
          
          {/* Comments */}
          {comments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">No comments yet</p>
              <p className="text-xs text-muted-foreground/70">Be the first to share what you think!</p>
            </div>
          ) : (
            <div className="px-4">
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
