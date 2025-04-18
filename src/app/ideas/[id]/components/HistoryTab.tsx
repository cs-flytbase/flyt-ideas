import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

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

interface HistoryTabProps {
  assignments: Assignment[];
  getInitials: (name: string) => string;
}

export function HistoryTab({ assignments, getInitials }: HistoryTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No activity recorded yet.</p>
          ) : (
            assignments.map((assignment, index) => (
              <div key={assignment.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={assignment.user.avatar_url} alt={assignment.user.display_name} />
                  <AvatarFallback>{getInitials(assignment.user.display_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{assignment.user.display_name}</span>
                    <time className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(assignment.assigned_at), { addSuffix: true })}</time>
                  </div>
                  <p className="text-sm text-muted-foreground">Implementation work was started on this idea</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
