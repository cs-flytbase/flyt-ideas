import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdeaCardProps {
  id: string | number;
  title: string;
  description: string;
  author: string;
  date: string;
  commentCount: number;
  upvotes: number;
  assignees?: {
    user: {
      display_name: string;
      avatar_url: string;
    };
  }[];
}

export function IdeaCard({
  id,
  title,
  description,
  author,
  date,
  commentCount,
  upvotes: initialUpvotes = 0,
  assignees = [],
}: IdeaCardProps) {
  const { user, isLoaded } = useUser();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isLoadingVote, setIsLoadingVote] = useState(false);
  
  // Show up to 3 assignees, with a +X for additional
  const displayAssignees = assignees?.slice(0, 3) || [];
  const additionalCount = (assignees?.length || 0) - 3;

  // Fetch user's current vote when component mounts
  useEffect(() => {
    if (isLoaded && user) {
      fetchUserVote();
    }
  }, [isLoaded, user, id]);

  // Fetch the user's current vote for this idea
  const fetchUserVote = async () => {
    try {
      setIsLoadingVote(true);
      const response = await fetch(`/api/ideas/${id}/vote`);
      if (response.ok) {
        const data = await response.json();
        setUserVote(data.vote?.vote_type || null);
      }
    } catch (error) {
      console.error("Error fetching vote:", error);
    } finally {
      setIsLoadingVote(false);
    }
  };

  // Handle voting
  const handleVote = async (voteType: number) => {
    if (!isLoaded || !user) return;

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
        setUpvotes(data.upvotes);
      }
    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex">
        <div className="mr-4 flex flex-col items-center">
          <button 
            className={cn(
              "text-foreground/70 hover:text-primary transition-colors",
              userVote === 1 && "text-primary"
            )}
            onClick={() => handleVote(1)}
            disabled={isVoting || !isLoaded || !user}
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
          <span className={cn(
            "my-1 text-sm font-semibold",
            upvotes > 0 && "text-primary",
            upvotes < 0 && "text-destructive"
          )}>
            {upvotes}
          </span>
          <button 
            className={cn(
              "text-foreground/70 hover:text-destructive transition-colors",
              userVote === -1 && "text-destructive"
            )}
            onClick={() => handleVote(-1)}
            disabled={isVoting || !isLoaded || !user}
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
        <div className="flex-1">
          <Link href={`/ideas/${id}`}>
            <h3 className="text-lg font-semibold hover:text-primary">{title}</h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span>Posted by {author}</span>
              <span>•</span>
              <span>{date}</span>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{commentCount} comments</span>
            </div>
          </div>
          {assignees && assignees.length > 0 && (
            <div className="mt-3 flex items-center">
              <span className="mr-2 text-xs text-muted-foreground">People working on this:</span>
              <div className="flex -space-x-2">
                <TooltipProvider>
                  {displayAssignees.map((assignee, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Avatar className="h-6 w-6 border border-background">
                          <AvatarImage src={assignee.user.avatar_url} alt={assignee.user.display_name} />
                          <AvatarFallback>{assignee.user.display_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{assignee.user.display_name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {additionalCount > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="flex h-6 w-6 items-center justify-center border border-background bg-muted text-xs">
                          <span>+{additionalCount}</span>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{additionalCount} more people working on this</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
