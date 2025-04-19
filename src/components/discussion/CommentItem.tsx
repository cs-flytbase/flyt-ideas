import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, MessageSquare, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CommentItemProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    votes?: number;
    author?: {
      id: string;
      display_name: string;
      avatar_url?: string;
    };
  };
  currentUser: any | null;
  type: "post" | "idea";
  parentId: string;
  onDeleteSuccess?: () => void;
}

export function CommentItem({ comment, currentUser, type, parentId, onDeleteSuccess }: CommentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [voteCount, setVoteCount] = useState(comment.votes || 0);
  const [userVote, setUserVote] = useState(0); // 0 for none, 1 for upvote, -1 for downvote
  const [isVoting, setIsVoting] = useState(false);

  // Calculate how long ago the comment was posted
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

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Check if the current user is the author of the comment
  const isUserComment = currentUser?.id === comment.author?.id;
  
  // Calculate time ago
  const timeAgo = getTimeAgo(new Date(comment.created_at));

  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser || isDeleting) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/${type}s/${parentId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Comment deleted",
          description: "Your comment has been removed",
          duration: 3000,
        });

        // Call the onDeleteSuccess callback if provided
        if (onDeleteSuccess) {
          onDeleteSuccess();
        } else {
          // Refresh the page if no callback is provided
          window.location.reload();
        }
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle voting on a comment
  const handleVote = async (voteType: number) => {
    if (!currentUser || isVoting) return;

    try {
      setIsVoting(true);
      
      // If user is clicking the same vote button they already selected, remove the vote
      const newVoteValue = userVote === voteType ? 0 : voteType;
      
      // Call the API to update the vote
      const response = await fetch(`/api/${type}s/${parentId}/comments/${comment.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote_type: newVoteValue }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the comment's votes count
        setVoteCount(data.votes || 0);
        setUserVote(newVoteValue);
      } else {
        throw new Error('Failed to register vote on comment');
      }
    } catch (err) {
      console.error('Error voting on comment:', err);
      toast({
        title: "Error",
        description: "Failed to register your vote on this comment. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="mb-4 py-2">
      {/* Comment header with author and timestamp */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="h-5 w-5 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
          {comment.author?.avatar_url ? (
            <img
              src={comment.author.avatar_url}
              alt={comment.author?.display_name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-medium">
              {getInitials(comment.author?.display_name || 'User')}
            </span>
          )}
        </div>
        <Link
          href={`/users/${comment.author?.id}`}
          className="font-medium text-xs hover:underline"
        >
          {comment.author?.display_name}
        </Link>
        <span className="text-xs text-muted-foreground">u2022 {timeAgo}</span>
      </div>
      
      {/* Comment content */}
      <div className="text-sm mb-2 pl-8">{comment.content}</div>
      
      {/* Comment actions */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground pl-8">
        <button 
          className="flex items-center px-1 py-0.5 hover:bg-muted/30 rounded-sm" 
          title="Upvote"
          onClick={() => handleVote(1)}
          disabled={isVoting}
        >
          {isVoting && userVote === 1 ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ArrowUp className={`h-4 w-4 ${userVote === 1 ? 'text-orange-500' : ''}`} />
          )}
        </button>
        
        <span className="text-xs font-medium mx-1">{voteCount}</span>
        
        <button 
          className="flex items-center px-1 py-0.5 hover:bg-muted/30 rounded-sm" 
          title="Downvote"
          onClick={() => handleVote(-1)}
          disabled={isVoting}
        >
          {isVoting && userVote === -1 ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ArrowDown className={`h-4 w-4 ${userVote === -1 ? 'text-blue-500' : ''}`} />
          )}
        </button>
        
        <button className="ml-2 hover:bg-muted/30 px-2 py-0.5 rounded-sm">
          Reply
        </button>
        
        {isUserComment && (
          <button 
            className="hover:bg-muted/30 px-2 py-0.5 rounded-sm text-destructive/80"
            onClick={() => handleDeleteComment(comment.id)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              'Delete'
            )}
          </button>
        )}
        
        <div className="flex-1"></div>
        
        <Button variant="ghost" size="sm" className="hover:bg-muted/30 px-2 py-0.5 rounded-sm hidden md:block h-auto">
          Report
        </Button>
      </div>
    </div>
  );
}
