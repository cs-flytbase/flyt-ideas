import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

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

interface CommentSectionProps {
  comments: Comment[];
  newComment: string;
  setNewComment: (value: string) => void;
  handleSubmitComment: () => void;
  isSubmitting: boolean;
  isUserLoaded: boolean;
  user: any;
  getInitials: (name: string) => string;
}

export function CommentSection({
  comments,
  newComment,
  setNewComment,
  handleSubmitComment,
  isSubmitting,
  isUserLoaded,
  user,
  getInitials
}: CommentSectionProps) {
  return (
    <div className="github-style-comments">
      {/* Timeline with vertical line - GitHub style */}
      <div className="relative pb-4">
        {/* Timeline vertical line */}
        <div className="absolute left-[21px] top-0 h-full w-[2px] bg-border"></div>

        {/* Comments list - GitHub style */}
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="relative ml-10">
                {/* Avatar on the timeline */}
                <div className="absolute -left-10 z-10 -mt-1">
                  <Avatar className="h-[42px] w-[42px] border-4 border-background">
                    <AvatarImage src={comment.user.avatar_url} alt={comment.user.display_name} />
                    <AvatarFallback>{getInitials(comment.user.display_name)}</AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Comment box - GitHub style */}
                <div className="rounded-md border shadow-sm">
                  {/* Comment header - GitHub style */}
                  <div className="bg-muted/30 border-b rounded-t-md px-4 py-2 flex items-center">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">{comment.user.display_name}</span>
                      <span className="text-xs text-muted-foreground">
                        commented {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Comment body - GitHub style */}
                  <div className="p-4 prose prose-sm max-w-none bg-card rounded-b-md text-sm">
                    <div className="whitespace-pre-line">{comment.content}</div>
                  </div>
                  
                  {/* GitHub style reactions */}
                  <div className="border-t py-1 px-4 bg-muted/10 flex items-center text-xs text-muted-foreground">
                    <button className="inline-flex items-center px-2 py-1 rounded-full hover:bg-muted">
                      <span className="mr-1">👍</span> 0
                    </button>
                    <button className="inline-flex items-center px-2 py-1 rounded-full hover:bg-muted ml-1">
                      <span className="mr-1">👎</span> 0
                    </button>
                    <button className="inline-flex items-center px-2 py-1 rounded-full hover:bg-muted ml-1">
                      <span className="mr-1">😄</span> 0
                    </button>
                    <button className="inline-flex items-center px-2 py-1 rounded-full hover:bg-muted ml-1">
                      <span className="mr-1">🎉</span> 0
                    </button>
                    <button className="inline-flex items-center px-2 py-1 rounded-full hover:bg-muted ml-1">
                      Add reaction
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-8 mb-8 bg-muted/20 py-10 rounded-md border border-dashed">
            <div className="text-center">
              <div className="text-muted-foreground mb-1 text-lg">No comments yet</div>
              <p className="text-sm text-muted-foreground">Be the first to start the discussion!</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Comment input - GitHub style */}
      {isUserLoaded && user ? (
        <div className="relative ml-10 mt-6">
          {/* Avatar on the timeline */}
          <div className="absolute -left-10 z-10 -mt-1">
            <Avatar className="h-[42px] w-[42px] border-4 border-background">
              <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
              <AvatarFallback>{getInitials(user.fullName || "")}</AvatarFallback>
            </Avatar>
          </div>
          
          {/* Comment box - GitHub style */}
          <div className="rounded-md border shadow-sm">
            {/* Placeholder text - GitHub style */}
            <div className="p-4 pb-0">
              <Textarea
                placeholder="Leave a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-28 border focus:border-primary bg-background resize-y"
              />
            </div>
            
            {/* GitHub style toolbar and button */}
            <div className="p-2 flex items-center justify-between border-t mt-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <span>Supports markdown</span>
              </div>
              <Button 
                onClick={handleSubmitComment} 
                disabled={isSubmitting || !newComment.trim()}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Comment"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
