import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDown, MessageSquare } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CommentSectionProps {
  comments: any[];
  itemId: string;
  user: any | null;
  showCommentBox: boolean;
  setShowCommentBox: (show: boolean) => void;
  type: "post" | "idea";
  renderComment: (comment: any) => React.ReactNode;
}

export function CommentSection({
  comments,
  itemId,
  user,
  showCommentBox,
  setShowCommentBox,
  type,
  renderComment,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user?.id) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/${type}s/${itemId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          user_id: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.statusText}`);
      }

      // Clear comment box and hide it
      setNewComment("");
      setShowCommentBox(false);

      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
        duration: 3000,
      });

      // Reload the page to show the new comment
      // In a real app, you might want to update the comments state instead
      window.location.reload();
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

  return (
    <div className="bg-white dark:bg-black rounded-lg border shadow-sm mt-4 overflow-hidden">
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
            <Button
              variant="ghost"
              className="text-xs h-6 px-2 py-0 flex items-center gap-1"
            >
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
          <p className="text-xs text-muted-foreground/70">
            Be the first to share what you think!
          </p>
        </div>
      ) : (
        <div className="px-4 py-2">
          {comments.map(renderComment)}
          {comments.length > 5 && (
            <Button variant="ghost" className="flex items-center gap-1 text-xs text-primary mt-2 mb-4">
              <span className="text-primary">Load more comments</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
