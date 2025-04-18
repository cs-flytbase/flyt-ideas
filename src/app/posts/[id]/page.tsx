"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { postsService } from "@/lib/database";
import { MainLayout } from "@/components/main-layout";

export default function PostPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

        setError(null);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Could not load post. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user?.id) return;

    try {
      setIsSubmitting(true);
      await postsService.addPostComment(id as string, newComment, user.id);
      
      // Refresh comments after adding a new one
      const commentsData = await postsService.getPostComments(id as string);
      setComments(commentsData);
      
      setNewComment("");
    } catch (err) {
      console.error("Error submitting comment:", err);
      setError("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!user?.id) return;
    
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      setIsDeletingComment(true);
      await postsService.deletePostComment(commentId, user.id);
      
      // Refresh comments after deleting one
      const commentsData = await postsService.getPostComments(id as string);
      setComments(commentsData);
      
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment. Please try again.");
    } finally {
      setIsDeletingComment(false);
    }
  };

  const renderComment = (comment: any) => {
    const isUserComment = user?.id === comment.user_id;
    
    return (
      <div key={comment.id} className="mb-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="mr-2 h-8 w-8">
                <AvatarImage src={comment.author?.avatar_url} alt={comment.author?.display_name} />
                <AvatarFallback>
                  {comment.author?.display_name ? getInitials(comment.author.display_name) : "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/users/${comment.user_id}`} className="font-medium hover:underline">
                  {comment.author?.display_name}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <p className="text-sm">{comment.content}</p>
          <div className="mt-3 flex justify-between text-xs text-muted-foreground">
            <button className="flex items-center hover:text-foreground">
              <ThumbsUp className="mr-1 h-4 w-4" />
              Like
            </button>
            
            {isUserComment && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDeleteComment(comment.id)}
                disabled={isDeletingComment}
                className="flex items-center text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    );
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
        <div className="px-4 py-6 md:px-6 lg:px-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-red-500">{error || "Post not found"}</p>
              <div className="mt-4 text-center">
                <Link href="/posts">
                  <Button>Back to Posts</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="px-4 py-6 md:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-4">
          <Link href="/posts">
            <Button variant="outline" size="sm">
              Back to Posts
            </Button>
          </Link>
          <UserButton afterSignOutUrl="/posts" />
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{post.title}</CardTitle>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Avatar className="mr-2 h-6 w-6">
                    <AvatarImage src={post.creator?.avatar_url} alt={post.creator?.display_name} />
                    <AvatarFallback>{getInitials(post.creator?.display_name)}</AvatarFallback>
                  </Avatar>
                  <Link href={`/users/${post.creator_id}`} className="font-medium hover:underline">
                    {post.creator?.display_name}
                  </Link>
                  <span className="mx-2">•</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {post.tags && post.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="prose max-w-none dark:prose-invert mb-6">
              <p>{post.content}</p>
            </div>
            
            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Comments ({comments.length})</h2>
              
              <div className="mb-6">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  disabled={!user}
                />
                <div className="mt-2 flex justify-end">
                  <Button onClick={handleSubmitComment} disabled={isSubmitting || !newComment.trim() || !user}>
                    {isSubmitting ? "Submitting..." : "Submit Comment"}
                  </Button>
                </div>
                {!user && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Please <Link href="/sign-in" className="text-primary hover:underline">sign in</Link> to leave a comment.
                  </p>
                )}
              </div>
              
              {comments.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map(renderComment)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
