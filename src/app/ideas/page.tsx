// app/ideas/page.tsx

"use client"

import { MainLayout } from "@/components/main-layout";
import { IdeaCard } from "@/components/idea-card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Loader2, Plus, Trophy } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TopContributor } from "@/lib/database";

// Type definition for an idea
interface Idea {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  is_published: boolean;
  published_at: string;
  status: string;
  upvotes: number;
  created_at: string;
  users: {
    display_name: string;
    avatar_url: string;
  };
  tags?: string[];
  idea_assignments?: any[];
  commentCount?: number;
}

const IdeasPage = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const { user } = useUser();

  // State for top contributors
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
  const [isLoadingContributors, setIsLoadingContributors] = useState(true);

  // New state for idea creation
  const [isNewIdeaDialogOpen, setIsNewIdeaDialogOpen] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDescription, setNewIdeaDescription] = useState("");
  const [newIdeaIsPublished, setNewIdeaIsPublished] = useState(true);
  const [newIdeaStatus, setNewIdeaStatus] = useState("draft");
  const [newIdeaTags, setNewIdeaTags] = useState("");
  const [isCreatingIdea, setIsCreatingIdea] = useState(false);

  // Categories for filtering
  const categories = [
    "All",
    "Product",
    "Design",
    "Engineering",
    "Marketing",
    "Research",
  ];

  useEffect(() => {
    const fetchPublishedIdeas = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/ideas?public=true');
        
        if (response.ok) {
          const data = await response.json();
          setIdeas(data.ideas || []);
        } else {
          console.error('Failed to fetch published ideas');
        }
      } catch (error) {
        console.error('Error fetching published ideas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublishedIdeas();
  }, []);
  
  // Fetch top contributors
  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        setIsLoadingContributors(true);
        const response = await fetch('/api/users/top-contributors?limit=5');
        if (response.ok) {
          const data = await response.json();
          setTopContributors(data);
        } else {
          console.error('Failed to fetch top contributors');
        }
      } catch (error) {
        console.error('Error fetching top contributors:', error);
      } finally {
        setIsLoadingContributors(false);
      }
    };

    fetchTopContributors();
  }, []);
  
  // Function to reset the new idea form
  const resetNewIdeaForm = () => {
    setNewIdeaTitle("");
    setNewIdeaDescription("");
    setNewIdeaIsPublished(true);
    setNewIdeaStatus("draft");
    setNewIdeaTags("");
  };
  
  // Function to handle creating a new idea
  const handleCreateNewIdea = async () => {
    if (!newIdeaTitle.trim()) return;
    
    try {
      setIsCreatingIdea(true);
      
      // Parse tags from comma-separated string to array
      const tagsArray = newIdeaTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newIdeaTitle,
          description: newIdeaDescription,
          is_published: newIdeaIsPublished,
          status: newIdeaStatus,
          tags: tagsArray,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Idea created successfully:', data);
        
        // Close dialog and reset form
        setIsNewIdeaDialogOpen(false);
        resetNewIdeaForm();
        
        // Refresh the ideas list if the new idea is published
        if (newIdeaIsPublished) {
          const response = await fetch('/api/ideas?public=true');
          if (response.ok) {
            const data = await response.json();
            setIdeas(data.ideas || []);
          }
        }
      } else {
        console.error('Failed to create idea');
      }
    } catch (error) {
      console.error('Error creating idea:', error);
    } finally {
      setIsCreatingIdea(false);
    }
  };

  // Handle category filtering
  const filteredIdeas = activeCategory === "All" 
    ? ideas 
    : ideas.filter(idea => idea.tags?.includes(activeCategory));

  return (
    <MainLayout>
      <div className="space-y-8 px-4 py-6 md:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Ideas</h1>
            <p className="text-muted-foreground">Browse and discuss ideas from the team</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => setIsNewIdeaDialogOpen(true)}
              className="inline-flex h-9 items-center justify-center"
            >
              <Plus className="mr-1 h-4 w-4" />
              New Idea
            </Button>
            <button className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1">
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
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                <polyline points="7.5 19.79 7.5 14.6 3 12" />
                <polyline points="21 12 16.5 14.6 16.5 19.79" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              View All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_272px]">
          <div className="space-y-4">
            <div className="rounded-lg border shadow-sm">
              <div className="flex flex-col items-center justify-between border-b px-4 py-3 sm:flex-row">
                <div className="flex flex-wrap items-center gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={activeCategory === category ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
                <div className="mt-2 flex items-center sm:mt-0">
                  <Label htmlFor="sort" className="mr-2 text-sm">
                    Sort by
                  </Label>
                  <select
                    id="sort"
                    className="rounded-md border p-1.5 text-sm"
                    defaultValue="newest"
                  >
                    <option>Newest</option>
                    <option>Most Upvoted</option>
                    <option>Most Discussed</option>
                  </select>
                </div>
              </div>
              <div className="divide-y p-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredIdeas.length > 0 ? (
                  filteredIdeas.map((idea) => (
                    <div key={idea.id} className="py-4 first:pt-0 last:pb-0">
                      <IdeaCard
                        id={idea.id}
                        title={idea.title}
                        description={idea.description || ""}
                        author={idea.users?.display_name || "Anonymous"}
                        date={new Date(idea.created_at).toLocaleDateString()}
                        commentCount={idea.commentCount || 0}
                        upvotes={idea.upvotes || 0}
                        assignees={idea.idea_assignments || []}
                      />
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No published ideas found.
                  </div>
                )}
              </div>
            </div>

            {filteredIdeas.length > 0 && (
              <div className="flex items-center justify-center">
                <button className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1">
                  Load More
                </button>
              </div>
            )}
          </div>

          <div className="hidden w-72 space-y-6 lg:block">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h3 className="mb-4 font-semibold">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Design System",
                  "UI/UX",
                  "API",
                  "Mobile",
                  "Workflow",
                  "Testing",
                  "Performance",
                  "Security",
                  "Feature Request",
                  "Bug Fix",
                ].map((tag, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h3 className="mb-4 font-semibold">Top Contributors</h3>
              <div className="space-y-3">
                {isLoadingContributors ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : topContributors.length === 0 ? (
                  <div className="py-2 text-center text-sm text-muted-foreground">
                    No contributor data available.
                  </div>
                ) : (
                  topContributors.map((contributor, index) => (
                    <div key={contributor.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="relative mr-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={contributor.avatar_url || undefined} 
                              alt={contributor.display_name} 
                            />
                            <AvatarFallback>
                              {contributor.display_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {index < 3 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <span className="text-sm">{contributor.display_name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {contributor.idea_count} ideas published
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Idea Dialog */}
      <Dialog open={isNewIdeaDialogOpen} onOpenChange={setIsNewIdeaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Idea</DialogTitle>
            <DialogDescription>
              Add details for your new idea. Required fields are marked with an asterisk (*).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-title" className="text-right">
                Title *
              </Label>
              <Input
                id="new-title"
                value={newIdeaTitle}
                onChange={(e) => setNewIdeaTitle(e.target.value)}
                className="col-span-3"
                placeholder="Enter a clear, descriptive title"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="new-description"
                value={newIdeaDescription}
                onChange={(e) => setNewIdeaDescription(e.target.value)}
                className="col-span-3"
                rows={4}
                placeholder="Describe your idea in detail"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-status" className="text-right">
                Status
              </Label>
              <select
                id="new-status"
                value={newIdeaStatus}
                onChange={(e) => setNewIdeaStatus(e.target.value)}
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="draft">Draft</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-tags" className="text-right">
                Tags
              </Label>
              <Input
                id="new-tags"
                value={newIdeaTags}
                onChange={(e) => setNewIdeaTags(e.target.value)}
                className="col-span-3"
                placeholder="technology, ai, project (comma-separated)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-visibility" className="text-right">
                Visibility
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="new-visibility"
                  checked={newIdeaIsPublished}
                  onCheckedChange={setNewIdeaIsPublished}
                />
                <Label htmlFor="new-visibility" className="cursor-pointer">
                  {newIdeaIsPublished ? "Public" : "Private"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                resetNewIdeaForm();
                setIsNewIdeaDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateNewIdea}
              disabled={isCreatingIdea || !newIdeaTitle.trim()}
            >
              {isCreatingIdea ? "Creating..." : "Create Idea"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default IdeasPage;
