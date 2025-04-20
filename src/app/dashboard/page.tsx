// app/dashboard/page.tsx
"use client"

import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { MainLayout } from "@/components/main-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Import our modular components
import { 
  IdeaList, 
  IdeaDetails, 
  IdeaDialog, 
  PostList, 
  PostDialog 
} from "@/components/dashboard";
import { Button } from "@/components/ui/button";

// Types 
interface Idea {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  is_public: boolean;
  is_published: boolean;
  published_at?: string;
  status: string;
  upvotes: number;
  created_at: string;
  updated_at: string;
  tags?: string[] | string;
  assignments?: any[];
  users?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  description?: string;
  creator_id: string;
  is_public?: boolean;
  upvotes: number;
  downvotes: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  creator?: {
    display_name: string;
    avatar_url?: string;
  };
  tags?: string[];
}

interface Checklist {
  id: string;
  title: string;
  progress: number;
  checklist_items: {
    id: string;
    text: string;
    completed: boolean;
    completed_by?: string;
    completed_at?: string;
  }[];
  is_shared: boolean;
  owner?: {
    display_name: string;
    avatar_url: string;
  };
}

const DashboardPage = () => {
  // State for ideas 
  const [myIdeas, setMyIdeas] = useState<Idea[]>([]);
  const [collaboratedIdeas, setCollaboratedIdeas] = useState<Idea[]>([]);
  const [myPicksIdeas, setMyPicksIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  
  // State for idea editing
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedIsPublic, setEditedIsPublic] = useState(false);
  const [editedStatus, setEditedStatus] = useState("draft");
  const [editedTags, setEditedTags] = useState<string[]>([]);
  
  // State for checklist management
  const [ideaChecklists, setIdeaChecklists] = useState<Checklist[]>([]);
  const [isLoadingChecklists, setIsLoadingChecklists] = useState(false);
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  
  // State for posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  
  // State for post editing
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedPostTitle, setEditedPostTitle] = useState("");
  const [editedPostContent, setEditedPostContent] = useState("");
  const [editedPostDescription, setEditedPostDescription] = useState("");
  const [editedPostIsPublic, setEditedPostIsPublic] = useState(true);
  const [editedPostTags, setEditedPostTags] = useState<string[]>([]);
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  
  // State for new idea dialog
  const [isNewIdeaDialogOpen, setIsNewIdeaDialogOpen] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDescription, setNewIdeaDescription] = useState("");
  const [newIdeaIsPublished, setNewIdeaIsPublished] = useState(false);
  const [newIdeaStatus, setNewIdeaStatus] = useState("draft");
  const [newIdeaTags, setNewIdeaTags] = useState<string[]>([]);
  const [isCreatingIdea, setIsCreatingIdea] = useState(false);
  
  // Get user
  const { user } = useUser();
  
  // ==== API Functions ====
  
  // Function to fetch ideas
  const fetchIdeas = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ideas', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMyIdeas(data.myIdeas || []);
        setCollaboratedIdeas(data.collaboratedIdeas || []);
        setMyPicksIdeas(data.myPicksIdeas || []);
        
        // Select first idea by default if available
        if (data.myIdeas?.length > 0) {
          setSelectedIdeaId(data.myIdeas[0].id);
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch ideas",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch posts
  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const response = await fetch('/api/posts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
        
        // Filter my posts if user is logged in
        if (user?.id) {
          const userPosts = data.posts.filter((post: Post) => post.creator_id === user.id) || [];
          setMyPosts(userPosts);
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch posts",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };
  
  // Function to fetch checklists for the selected idea
  const fetchChecklists = async () => {
    if (!selectedIdeaId) {
      setIdeaChecklists([]);
      return;
    }
    
    try {
      setIsLoadingChecklists(true);
      const response = await fetch(`/api/ideas/${selectedIdeaId}/checklists`);
      
      if (response.ok) {
        const data = await response.json();
        const allChecklists = [
          ...(data.personalChecklists || []),
          ...(data.sharedChecklists || [])
        ];
        setIdeaChecklists(allChecklists);
      } else {
        console.error("Failed to fetch checklists");
      }
    } catch (error) {
      console.error("Error fetching checklists:", error);
    } finally {
      setIsLoadingChecklists(false);
    }
  };
  
  // Update checklists when selected idea changes
  useEffect(() => {
    fetchChecklists();
  }, [selectedIdeaId]);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchIdeas();
    fetchPosts();
  }, [user]);
  
  // ==== Handler Functions ====
  
  // Idea handlers
  const handleIdeaClick = (idea: Idea) => {
    setSelectedIdeaId(idea.id);
  };
  
  const handleCreateChecklist = async () => {
    if (!selectedIdeaId || !newChecklistTitle.trim()) return;
    
    try {
      const response = await fetch(`/api/ideas/${selectedIdeaId}/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newChecklistTitle,
          isShared: true
        }),
      });
      
      if (response.ok) {
        const newChecklist = await response.json();
        setIdeaChecklists(prev => [...prev, newChecklist]);
        setNewChecklistTitle('');
        setIsChecklistDialogOpen(false);
        toast({ description: "Checklist created successfully" });
      } else {
        toast({
          title: "Error",
          description: "Failed to create checklist",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating checklist:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };
  
  // Function for handling adding a checklist item
  const handleAddChecklistItem = async (checklistId: string, text: string) => {
    try {
      const response = await fetch(`/api/checklists/${checklistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (response.ok) {
        const newItem = await response.json();
        setIdeaChecklists(prev => {
          const updatedChecklists = [...prev];
          const checklistIndex = updatedChecklists.findIndex(cl => cl.id === checklistId);
          
          if (checklistIndex !== -1) {
            updatedChecklists[checklistIndex] = {
              ...updatedChecklists[checklistIndex],
              checklist_items: [
                ...updatedChecklists[checklistIndex].checklist_items,
                newItem
              ]
            };
          }
          return updatedChecklists;
        });
      }
    } catch (error) {
      console.error('Error adding checklist item:', error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive"
      });
    }
  };
  
  // Toggle checklist item completion
  const handleToggleChecklistItem = async (checklistId: string, itemId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/checklists/${checklistId}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          completed: !completed
        }),
      });
      
      if (response.ok) {
        // Update the item in state
        setIdeaChecklists(prev => {
          const updatedChecklists = [...prev];
          const checklistIndex = updatedChecklists.findIndex(cl => cl.id === checklistId);
          
          if (checklistIndex !== -1) {
            const items = [...updatedChecklists[checklistIndex].checklist_items];
            const itemIndex = items.findIndex(item => item.id === itemId);
            
            if (itemIndex !== -1) {
              items[itemIndex] = {
                ...items[itemIndex],
                completed: !completed
              };
            }
            
            updatedChecklists[checklistIndex] = {
              ...updatedChecklists[checklistIndex],
              checklist_items: items
            };
          }
          return updatedChecklists;
        });
      }
    } catch (error) {
      console.error('Error toggling checklist item:', error);
    }
  };
  
  // Function to handle deleting a checklist item
  const handleDeleteChecklistItem = async (checklistId: string, itemId: string) => {
    try {
      const response = await fetch(`/api/checklists/${checklistId}/items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove the item from state
        setIdeaChecklists(prev => {
          const updatedChecklists = [...prev];
          const checklistIndex = updatedChecklists.findIndex(cl => cl.id === checklistId);
          
          if (checklistIndex !== -1) {
            updatedChecklists[checklistIndex] = {
              ...updatedChecklists[checklistIndex],
              checklist_items: updatedChecklists[checklistIndex].checklist_items.filter(
                item => item.id !== itemId
              )
            };
          }
          return updatedChecklists;
        });
      }
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive"
      });
    }
  };
  
  // Function to handle deleting a checklist
  const handleDeleteChecklist = async (checklistId: string) => {
    try {
      const response = await fetch(`/api/checklists/${checklistId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setIdeaChecklists(prev => prev.filter(cl => cl.id !== checklistId));
        toast({ description: "Checklist deleted successfully" });
      }
    } catch (error) {
      console.error('Error deleting checklist:', error);
      toast({
        title: "Error",
        description: "Failed to delete checklist",
        variant: "destructive"
      });
    }
  };
  
  // Add this function to handle publish state updates
  const handlePublishIdea = async (ideaId: string) => {
    try {
      const updatedIdeas = myIdeas.map(idea => 
        idea.id === ideaId ? { ...idea, is_published: true } : idea
      );
      setMyIdeas(updatedIdeas);
    } catch (error) {
      console.error('Error updating local state:', error);
    }
  };
  
  // Post handlers
  const handleEditPost = (post: Post) => {
    setEditingPostId(post.id);
    setEditedPostTitle(post.title);
    setEditedPostContent(post.content);
    setEditedPostDescription(post.description || '');
    setEditedPostIsPublic(post.is_public ?? true);
    setEditedPostTags(post.tags || []);
    setIsEditingPost(true);
  };
  
  const handleCreateNewPost = () => {
    setEditingPostId(null);
    setEditedPostTitle('');
    setEditedPostContent('');
    setEditedPostDescription('');
    setEditedPostIsPublic(true);
    setEditedPostTags([]);
    setIsEditingPost(true);
  };
  
  const handleSavePost = async () => {
    try {
      setIsUpdatingPost(true);
      const isNewPost = !editingPostId;
      
      const url = isNewPost ? '/api/posts' : `/api/posts/${editingPostId}`;
      const method = isNewPost ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedPostTitle,
          content: editedPostContent,
          description: editedPostDescription,
          is_public: editedPostIsPublic,
          tags: editedPostTags,
        }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        
        if (isNewPost) {
          setPosts(prev => [updatedPost, ...prev]);
          if (updatedPost.creator_id === user?.id) {
            setMyPosts(prev => [updatedPost, ...prev]);
          }
          toast({ description: "Post created successfully" });
        } else {
          setPosts(prev => prev.map(p => p.id === editingPostId ? updatedPost : p));
          if (updatedPost.creator_id === user?.id) {
            setMyPosts(prev => prev.map(p => p.id === editingPostId ? updatedPost : p));
          }
          toast({ description: "Post updated successfully" });
        }
        
        setIsEditingPost(false);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to save post",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPost(false);
    }
  };
  
  // Find selected idea
  const selectedIdea = selectedIdeaId 
    ? [...myIdeas, ...collaboratedIdeas, ...myPicksIdeas].find(idea => idea.id === selectedIdeaId)
    : null;
  
  return (
    <MainLayout>
      <div className="container mx-auto p-4 space-y-6">
        <Tabs defaultValue="ideas" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="ideas">Ideas</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>
          
          {/* Ideas Tab Content */}
          <TabsContent value="ideas" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ideas List Section - 1/3 width on large screens */}
              <div className="lg:col-span-1">
                <Tabs defaultValue="my-ideas" className="w-full">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="my-ideas" className="flex-1">My Ideas</TabsTrigger>
                    <TabsTrigger value="my-picks" className="flex-1">My Picks</TabsTrigger>
                    <TabsTrigger value="collaborated" className="flex-1">Collaborated</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="my-ideas">
                    {isLoading ? (
                      <div className="flex flex-col space-y-4 p-4">
                        <div className="h-8 w-full bg-muted rounded-md animate-pulse"></div>
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 border rounded-md space-y-2 animate-pulse">
                              <div className="flex justify-between">
                                <div className="h-4 w-1/3 bg-muted rounded-md"></div>
                                <div className="h-4 w-16 bg-muted rounded-full"></div>
                              </div>
                              <div className="h-3 w-full bg-muted rounded-md"></div>
                              <div className="flex justify-between">
                                <div className="h-3 w-20 bg-muted rounded-md"></div>
                                <div className="h-3 w-16 bg-muted rounded-full"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : myIdeas.length > 0 ? (
                      <IdeaList
                        ideas={myIdeas}
                        selectedIdeaId={selectedIdeaId}
                        onIdeaClick={handleIdeaClick}
                        onEditIdea={(idea) => {
                          setEditingIdea(idea);
                          setEditedTitle(idea.title);
                          setEditedDescription(idea.description || "");
                        }}
                        onPublishIdea={handlePublishIdea}
                        onNewIdeaClick={() => setIsNewIdeaDialogOpen(true)}
                      />
                    ) : (
                      <div className="p-6 text-center">
                        <div className="rounded-full w-12 h-12 bg-muted flex items-center justify-center mx-auto mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                          </svg>
                        </div>
                        <h3 className="font-medium">No ideas found</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">Get started by creating your first idea</p>
                        <button 
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                          onClick={() => setIsNewIdeaDialogOpen(true)}
                        >
                          Create New Idea
                        </button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="my-picks">
                    {isLoading ? (
                      <div className="flex flex-col space-y-4 p-4">
                        <div className="h-8 w-full bg-muted rounded-md animate-pulse"></div>
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 border rounded-md space-y-2 animate-pulse">
                              <div className="flex justify-between">
                                <div className="h-4 w-1/3 bg-muted rounded-md"></div>
                                <div className="h-4 w-16 bg-muted rounded-full"></div>
                              </div>
                              <div className="h-3 w-full bg-muted rounded-md"></div>
                              <div className="flex justify-between">
                                <div className="h-3 w-20 bg-muted rounded-md"></div>
                                <div className="h-3 w-16 bg-muted rounded-full"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : myPicksIdeas.length > 0 ? (
                      <IdeaList
                        ideas={myPicksIdeas}
                        selectedIdeaId={selectedIdeaId}
                        onIdeaClick={handleIdeaClick}
                        onEditIdea={(idea) => {
                          setEditingIdea(idea);
                          setEditedTitle(idea.title);
                          setEditedDescription(idea.description || "");
                        }}
                        onPublishIdea={handlePublishIdea}
                        onNewIdeaClick={() => setIsNewIdeaDialogOpen(true)}
                      />
                    ) : (
                      <div className="p-6 text-center">
                        <div className="rounded-full w-12 h-12 bg-muted flex items-center justify-center mx-auto mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                          </svg>
                        </div>
                        <h3 className="font-medium">No picked ideas</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">You haven't picked any ideas yet</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="collaborated">
                    {isLoading ? (
                      <div className="flex flex-col space-y-4 p-4">
                        <div className="h-8 w-full bg-muted rounded-md animate-pulse"></div>
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 border rounded-md space-y-2 animate-pulse">
                              <div className="flex justify-between">
                                <div className="h-4 w-1/3 bg-muted rounded-md"></div>
                                <div className="h-4 w-16 bg-muted rounded-full"></div>
                              </div>
                              <div className="h-3 w-full bg-muted rounded-md"></div>
                              <div className="flex justify-between">
                                <div className="h-3 w-20 bg-muted rounded-md"></div>
                                <div className="h-3 w-16 bg-muted rounded-full"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : collaboratedIdeas.length > 0 ? (
                      <IdeaList
                        ideas={collaboratedIdeas}
                        selectedIdeaId={selectedIdeaId}
                        onIdeaClick={handleIdeaClick}
                        onEditIdea={(idea) => {
                          setEditingIdea(idea);
                          setEditedTitle(idea.title);
                          setEditedDescription(idea.description || "");
                        }}
                        onPublishIdea={handlePublishIdea}
                        onNewIdeaClick={() => setIsNewIdeaDialogOpen(true)}
                      />
                    ) : (
                      <div className="p-6 text-center">
                        <div className="rounded-full w-12 h-12 bg-muted flex items-center justify-center mx-auto mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-muted-foreground">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                          </svg>
                        </div>
                        <h3 className="font-medium">No collaborated ideas</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">You're not collaborating on any ideas yet</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
              
              {/* Idea Details Section - 2/3 width on large screens */}
              <div className="lg:col-span-2">
                <IdeaDetails
                  selectedIdea={selectedIdea}
                  checklists={ideaChecklists}
                  isLoadingChecklists={isLoadingChecklists}
                  onCreateChecklist={() => setIsChecklistDialogOpen(true)}
                  onAddChecklistItem={handleAddChecklistItem}
                  onToggleChecklistItem={handleToggleChecklistItem}
                  onDeleteChecklistItem={handleDeleteChecklistItem}
                  onDeleteChecklist={handleDeleteChecklist}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Posts Tab Content */}
          <TabsContent value="posts" className="space-y-6">
            <Tabs defaultValue="all-posts" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all-posts">All Posts</TabsTrigger>
                <TabsTrigger value="my-posts">My Posts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all-posts">
                <PostList
                  posts={posts}
                  onEditPost={handleEditPost}
                  onCreatePost={handleCreateNewPost}
                />
              </TabsContent>
              
              <TabsContent value="my-posts">
                <PostList
                  posts={myPosts}
                  onEditPost={handleEditPost}
                  onCreatePost={handleCreateNewPost}
                  isMyPosts={true}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
        
        {/* Post Edit Dialog */}
        <PostDialog
          isOpen={isEditingPost}
          onOpenChange={setIsEditingPost}
          title={editedPostTitle}
          content={editedPostContent}
          description={editedPostDescription}
          isPublic={editedPostIsPublic}
          tags={editedPostTags}
          isProcessing={isUpdatingPost}
          onSave={handleSavePost}
          onCancel={() => setIsEditingPost(false)}
          onTitleChange={setEditedPostTitle}
          onContentChange={setEditedPostContent}
          onDescriptionChange={setEditedPostDescription}
          onIsPublicChange={setEditedPostIsPublic}
          onTagsChange={setEditedPostTags}
          dialogTitle={editingPostId ? "Edit Post" : "Create New Post"}
          dialogDescription={editingPostId 
            ? "Make changes to your post. Click save when you're done."
            : "Create a new post to share with the community."}
          saveButtonText={editingPostId ? "Save Changes" : "Create Post"}
        />

        {/* Idea Edit Dialog */}
        {editingIdea && (
          <Dialog open={!!editingIdea} onOpenChange={() => setEditingIdea(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Idea</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input 
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/ideas/${editingIdea.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: editedTitle,
                          description: editedDescription
                        })
                      });
                      
                      if (response.ok) {
                        fetchIdeas();
                        setEditingIdea(null);
                      }
                    } catch (error) {
                      console.error('Error updating idea:', error);
                    }
                  }}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Idea Dialog */}
        <IdeaDialog
          isOpen={isNewIdeaDialogOpen}
          onOpenChange={setIsNewIdeaDialogOpen}
          title={newIdeaTitle}
          description={newIdeaDescription}
          isPublic={newIdeaIsPublished}
          status={newIdeaStatus}
          tags={newIdeaTags}
          isCreating={isCreatingIdea}
          onSave={async () => {
            try {
              setIsCreatingIdea(true);
              const response = await fetch('/api/ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: newIdeaTitle,
                  description: newIdeaDescription,
                  is_public: newIdeaIsPublished,
                  status: newIdeaStatus,
                  tags: newIdeaTags,
                }),
              });

              if (response.ok) {
                const newIdea = await response.json();
                setMyIdeas(prev => [newIdea, ...prev]);
                setIsNewIdeaDialogOpen(false);
                setNewIdeaTitle('');
                setNewIdeaDescription('');
                setNewIdeaIsPublished(false);
                setNewIdeaStatus('draft');
                setNewIdeaTags([]);
                toast({ description: "Idea created successfully" });
              } else {
                const error = await response.json();
                toast({
                  title: "Error",
                  description: error.message || "Failed to create idea",
                  variant: "destructive"
                });
              }
            } catch (error) {
              console.error('Error creating idea:', error);
              toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive"
              });
            } finally {
              setIsCreatingIdea(false);
            }
          }}
          onCancel={() => setIsNewIdeaDialogOpen(false)}
          onTitleChange={setNewIdeaTitle}
          onDescriptionChange={setNewIdeaDescription}
          onIsPublicChange={setNewIdeaIsPublished}
          onStatusChange={setNewIdeaStatus}
          onTagsChange={setNewIdeaTags}
          dialogTitle="Create New Idea"
          dialogDescription="Create a new idea to share with the community."
          saveButtonText="Create Idea"
        />
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
