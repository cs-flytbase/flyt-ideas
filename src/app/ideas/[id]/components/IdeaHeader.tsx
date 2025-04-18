import Link from "next/link";
import { ArrowLeft, AlertCircle, MessageSquare, CheckSquare, History, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IdeaHeaderProps {
  id: string;
  title: string;
  status: string;
  upvotes: number;
  commentCount: number;
  setActiveTab: (tab: string) => void;
  activeTab: string;
  isUserAssigned: boolean;
  isAssigning: boolean;
  isUnassigning: boolean;
  handlePickIdea: () => void;
  handleUnpickIdea: () => void;
  handleVote: (voteType: number) => void;
  isVoting: boolean;
  userVote: number | null;
}

export function IdeaHeader({
  id,
  title,
  status,
  upvotes,
  commentCount,
  setActiveTab,
  activeTab,
  isUserAssigned,
  isAssigning,
  isUnassigning,
  handlePickIdea,
  handleUnpickIdea,
  handleVote,
  isVoting,
  userVote
}: IdeaHeaderProps) {
  return (
    <div className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8">
        <div className="mb-4">
          <Link href="/ideas" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to ideas
          </Link>
        </div>
        
        {/* Idea title and actions */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold truncate flex items-center">
              {title}
              <div className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {status || "Open"}
              </div>
            </h1>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isUserAssigned ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleUnpickIdea}
                disabled={isUnassigning}
                className="text-xs"
              >
                {isUnassigning ? "Removing..." : "Unwatch"}
              </Button>
            ) : (
              <Button 
                variant="outline"
                size="sm"
                onClick={handlePickIdea}
                disabled={isAssigning}
                className="text-xs"
              >
                {isAssigning ? "Watching..." : "Watch"}
              </Button>
            )}
            
            {/* Upvote Button */}
            <Button
              variant={userVote === 1 ? "default" : "outline"}
              size="sm"
              onClick={() => handleVote(1)}
              disabled={isVoting}
              className="text-xs"
            >
              <Star className="mr-1 h-3 w-3" />
              Star <span className="ml-1 bg-muted rounded-full px-1.5">{upvotes || 0}</span>
            </Button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="mt-4 border-b pb-1">
          <nav className="flex overflow-x-auto">
            <div className="flex -mb-px">
              <Link 
                href={`/ideas/${id}`} 
                className="flex items-center px-4 py-2 border-b-2 border-primary font-medium text-sm"
              >
                <AlertCircle className="mr-1 h-4 w-4" />
                Idea <span className="ml-1 bg-muted rounded-full px-2">1</span>
              </Link>
              
              <Link 
                href={`/ideas/${id}#discussion`} 
                onClick={() => setActiveTab("discussion")}
                className="flex items-center px-4 py-2 border-b-2 border-transparent hover:border-gray-300 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                Discussion <span className="ml-1 bg-muted rounded-full px-2">{commentCount}</span>
              </Link>
              
              <Link 
                href={`/ideas/${id}#implementation`}
                onClick={() => setActiveTab("implementation")}
                className="flex items-center px-4 py-2 border-b-2 border-transparent hover:border-gray-300 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <CheckSquare className="mr-1 h-4 w-4" />
                Implementation
              </Link>
              
              <Link 
                href={`/ideas/${id}#history`}
                onClick={() => setActiveTab("history")}
                className="flex items-center px-4 py-2 border-b-2 border-transparent hover:border-gray-300 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <History className="mr-1 h-4 w-4" />
                History
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
