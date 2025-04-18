// app/ideas/[id]/page.tsx

"use client";

import "./github-style.css";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ThumbsUp, 
  ThumbsDown,
  MessageSquare, 
  CheckSquare, 
  Loader2, 
  Users,
  Trash2,
  ArrowLeft,
  Tag,
  AlertCircle,
  History,
} from "lucide-react";
import Link from "next/link";
import { MainLayout } from "@/components/main-layout";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";

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

export default function IdeaPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [idea, setIdea] = useState<any | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUnassigning, setIsUnassigning] = useState(false);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("discussion");
  const [commentCount, setCommentCount] = useState(0);
  
  // Add state for history tab
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Checklist states
  const [checklists, setChecklists] = useState<{ 
    personal: any[], 
    shared: any[] 
  }>({ 
    personal: [], 
    shared: [] 
  });
  const [isLoadingChecklists, setIsLoadingChecklists] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newChecklistType, setNewChecklistType] = useState<"personal" | "shared">("personal");
  const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [isAddingItem, setIsAddingItem] = useState<Record<string, boolean>>({});
  const [checklistToDeleteId, setChecklistToDeleteId] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeletingChecklist, setIsDeletingChecklist] = useState(false);

  useEffect(() => {
    async function fetchIdea() {
      if (!id) return;
      
      try {
        setLoading(true);
        // Fetch idea details
        const ideaResponse = await fetch(`/api/ideas/${id}`);
        if (!ideaResponse.ok) {
          throw new Error('Failed to fetch idea');
        }
        const ideaData = await ideaResponse.json();
        setIdea(ideaData);

        // Set the comment count from the API response
        setCommentCount(ideaData.comment_count || 0);

        // Fetch comments for this idea
        const commentsResponse = await fetch(`/api/ideas/${id}/comments`);
        if (!commentsResponse.ok) {
          throw new Error('Failed to fetch comments');
        }
        const commentsData = await commentsResponse.json();
        setComments(commentsData);

        // Fetch assignments for this idea
        const assignmentsResponse = await fetch(`/api/ideas/${id}/assignments`);
        if (!assignmentsResponse.ok) {
          throw new Error('Failed to fetch assignments');
        }
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData);

        // Fetch user's vote if logged in
        if (user) {
          const voteResponse = await fetch(`/api/ideas/${id}/vote`);
          if (voteResponse.ok) {
            const voteData = await voteResponse.json();
            if (voteData.vote) {
              setUserVote(voteData.vote.vote_type);
            }
          }
        }

        if (activeTab === 'implementation') {
          fetchChecklists();
        }

        // Fetch history if on history tab
        if (activeTab === 'history') {
          fetchHistory();
        }

        setError(null);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        console.error('Error fetching idea data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchIdea();
  }, [id, user, activeTab]);

  async function fetchChecklists() {
    if (!id || !user) return;
    
    try {
      setIsLoadingChecklists(true);
      
      const response = await fetch(`/api/ideas/${id}/checklists`);
      if (!response.ok) {
        throw new Error('Failed to fetch checklists');
      }
      
      const data = await response.json();
      setChecklists(data);
    } catch (error) {
      console.error('Error fetching checklists:', error);
    } finally {
      setIsLoadingChecklists(false);
    }
  }
  
  // Add function to fetch history
  async function fetchHistory() {
    if (!id) return;
    
    try {
      setIsLoadingHistory(true);
      
      // This would be a real API endpoint in a production app
      // For demo, we'll create mock history data
      const mockHistory = [
        {
          id: '1',
          action: 'created',
          user: idea?.user,
          timestamp: idea?.created_at
        },
        {
          id: '2',
          action: 'updated',
          field: 'description',
          user: idea?.user,
          timestamp: new Date(new Date(idea?.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString()
        },
        ...assignments.map((assignment, index) => ({
          id: `assignment-${index}`,
          action: 'assigned',
          user: assignment.user,
          timestamp: assignment.assigned_at
        }))
      ];
      
      setHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }

  async function handleSubmitComment() {
    if (!newComment.trim() || !id || !user) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`/api/ideas/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }
      
      const data = await response.json();
      
      // Add the new comment to the list and increment the count
      setComments([...comments, data]);
      setCommentCount(prevCount => prevCount + 1);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePickIdea() {
    if (!id || !user) return;
    
    try {
      setIsAssigning(true);
      
      const response = await fetch(`/api/ideas/${id}/assignments`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign to idea');
      }
      
      const newAssignment = await response.json();
      
      setAssignments([...assignments, newAssignment]);
    } catch (error) {
      console.error('Error picking idea:', error);
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleUnpickIdea() {
    if (!id || !user) return;
    
    try {
      setIsUnassigning(true);
      
      const response = await fetch(`/api/ideas/${id}/assignments`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to unassign from idea');
      }
      
      setAssignments(assignments.filter(a => a.user_id !== user.id));
    } catch (error) {
      console.error('Error unpicking idea:', error);
    } finally {
      setIsUnassigning(false);
    }
  }

  function getInitials(name: string) {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  async function handleVote(voteType: number) {
    if (!id || !user || isVoting) return;
    
    try {
      setIsVoting(true);
      
      // If user clicked the same vote type that's already active, treat as removing the vote
      const effectiveVoteType = userVote === voteType ? 0 : voteType;
      
      const response = await fetch(`/api/ideas/${id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType: effectiveVoteType }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }
      
      const data = await response.json();
      
      // Update idea with new vote count and user's vote
      setIdea({
        ...idea,
        upvotes: data.upvotes,
      });
      
      setUserVote(effectiveVoteType === 0 ? null : effectiveVoteType);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  }

  // Loading and error states
  if (loading) {
    return (
      <MainLayout>
        <div className="container px-4 py-6 md:px-6 lg:px-8 flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error || !idea) {
    return (
      <MainLayout>
        <div className="container px-4 py-6 md:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-xl text-red-500">{error || "Idea not found"}</p>
            <Link href="/ideas" className="mt-4 text-primary hover:underline">
              Back to ideas
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
}
