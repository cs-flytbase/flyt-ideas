import { useState } from "react";
import { ArrowDown, ArrowUp, Bookmark, MessageSquare, Share2, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface VotingActionsProps {
  id: string;
  upvotes: number;
  commentCount: number;
  user: any | null;
  userVote: number;
  type: "post" | "idea";
  onCommentClick: () => void;
}

export function VotingActions({
  id,
  upvotes,
  commentCount,
  user,
  userVote: initialUserVote,
  type,
  onCommentClick,
}: VotingActionsProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [voteCount, setVoteCount] = useState(upvotes);

  // Handle voting
  const handleVote = async (voteType: number) => {
    if (!user || isVoting) return;

    try {
      setIsVoting(true);
      
      // If user is clicking the same vote button they already selected, remove the vote
      const newVoteValue = userVote === voteType ? 0 : voteType;
      
      // Call the API to update the vote
      const response = await fetch(`/api/${type}s/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote_type: newVoteValue }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the item's upvotes count
        setVoteCount(data.upvotes);
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
            description: `You ${newVoteValue === 1 ? 'upvoted' : 'downvoted'} this ${type}`,
            duration: 3000,
          });
        }
      } else {
        throw new Error('Failed to register vote');
      }
    } catch (err) {
      console.error(`Error voting on ${type}:`, err);
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

  return (
    <div className="border-t border-b py-2 my-3">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center bg-muted/40 hover:bg-muted/60 rounded-full py-1.5 px-3 transition-colors">
          <button
            onClick={() => user && handleVote(1)}
            disabled={isVoting}
            className="flex items-center p-0.5"
            aria-label="Upvote"
          >
            {isVoting && userVote === 1 ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-1" />
            ) : (
              <ArrowUp className={`h-4 w-4 sm:h-5 sm:w-5 mr-1.5 ${userVote === 1 ? 'text-orange-500 fill-orange-500' : ''}`} />
            )}
          </button>
          <span className="text-xs sm:text-sm font-medium min-w-5 text-center">{voteCount || 0}</span>
          <button
            onClick={() => user && handleVote(-1)}
            disabled={isVoting}
            className="flex items-center p-0.5 ml-1.5"
            aria-label="Downvote"
          >
            {isVoting && userVote === -1 ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <ArrowDown className={`h-4 w-4 sm:h-5 sm:w-5 ${userVote === -1 ? 'text-blue-500 fill-blue-500' : ''}`} />
            )}
          </button>
        </div>
        
        <button 
          className="flex items-center gap-1.5 bg-muted/40 hover:bg-muted/60 rounded-full py-1.5 px-3 transition-colors"
          onClick={onCommentClick}
        >
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-xs sm:text-sm">
            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
          </span>
        </button>
        
        <div className="hidden sm:flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-1.5 bg-muted/40 hover:bg-muted/60 rounded-full py-1.5 px-3 transition-colors">
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs sm:text-sm">Share</span>
          </button>
          
          <button className="flex items-center gap-1.5 bg-muted/40 hover:bg-muted/60 rounded-full py-1.5 px-3 transition-colors">
            <Bookmark className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-xs sm:text-sm">Save</span>
          </button>
        </div>
        
        <div className="sm:hidden ml-auto">
          <button className="flex items-center gap-1.5 bg-muted/40 hover:bg-muted/60 rounded-full p-2 transition-colors">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
