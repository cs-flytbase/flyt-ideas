// app/dashboard/page.tsx
"use client"

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { 
  ArrowUpRight,
  CheckSquare,
  Clock, 
  EyeIcon, 
  EyeOffIcon, 
  ListFilter,
  MoreHorizontal, 
  Plus, 
  PlusCircle, 
  Pencil,
  UserPlus, 
  Users,
  X,
  Trophy
} from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { Trash2 } from "lucide-react";
import { TopContributor } from "@/lib/database";

// Type definition for an idea
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
  assignments?: {
    id: string;
    user_id: string;
    status: string;
    assigned_at: string;
    completed_at?: string;
    assignee?: {
      display_name: string;
      avatar_url?: string;
    };
  }[];
  users?: {
    display_name: string;
    avatar_url?: string;
  };
}

// Type definition for a checklist
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
  // State for ideas and loading
  const [myIdeas, setMyIdeas] = useState<Idea[]>([]);
  const [collaboratedIdeas, setCollaboratedIdeas] = useState<Idea[]>([]);
  const [myPicksIdeas, setMyPicksIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for selected idea and checklists
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [ideaChecklists, setIdeaChecklists] = useState<Checklist[]>([]);
  const [isLoadingChecklists, setIsLoadingChecklists] = useState(false);
  
  // State for checklist management
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newChecklistType, setNewChecklistType] = useState<"personal" | "shared">("personal");
  const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [isAddingItem, setIsAddingItem] = useState<Record<string, boolean>>({});
  const [isDeletingItem, setIsDeletingItem] = useState<Record<string, boolean>>({});
  const [checklistToDeleteId, setChecklistToDeleteId] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeletingChecklist, setIsDeletingChecklist] = useState(false);
  const [checklistIdeaId, setChecklistIdeaId] = useState<string | null>(null);
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);

  // State for the edited idea form
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedIsPublic, setEditedIsPublic] = useState(false);
  const [editedStatus, setEditedStatus] = useState("draft");
  const [editedTags, setEditedTags] = useState<string[]>([]);

  // State for new idea creation
  const [isNewIdeaDialogOpen, setIsNewIdeaDialogOpen] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState("");
  const [newIdeaDescription, setNewIdeaDescription] = useState("");
  const [newIdeaIsPublished, setNewIdeaIsPublished] = useState(false);
  const [newIdeaStatus, setNewIdeaStatus] = useState("draft");
  const [newIdeaTags, setNewIdeaTags] = useState("");
  const [tagArray, setTagArray] = useState<string[]>([]);
  const [isCreatingIdea, setIsCreatingIdea] = useState(false);

  // Get current user
  const { user } = useUser();

  // Fetch ideas when component mounts
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/ideas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',  // Include cookies and auth credentials
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setMyIdeas(data.myIdeas || []);
          setCollaboratedIdeas(data.collaboratedIdeas || []);
          setMyPicksIdeas(data.myPicksIdeas || []);
          
          // If there are ideas, select the first one by default
          if (data.myIdeas?.length > 0) {
            setSelectedIdeaId(data.myIdeas[0].id);
          }
        } else {
          console.error('Failed to fetch ideas:', data.error);
        }
      } catch (error) {
        console.error('Error fetching ideas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeas();
  }, []);

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
        
        // Combine personal and shared checklists
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

  // Fetch checklists when selected idea changes
  useEffect(() => {
    fetchChecklists();
  }, [selectedIdeaId]);

  // Find the selected idea
  const selectedIdea = selectedIdeaId 
    ? [...myIdeas, ...collaboratedIdeas].find(idea => idea.id === selectedIdeaId)
    : undefined;

  // Function to handle clicking an idea - just selects it
  const handleIdeaClick = (idea: Idea) => {
    setSelectedIdeaId(idea.id);
  };

  // Function to handle editing an idea
  const handleEditIdea = (idea: Idea) => {
    setEditingIdeaId(idea.id);
    setEditedTitle(idea.title);
    setEditedDescription(idea.description);
    setEditedIsPublic(idea.is_public);
    setEditedStatus(idea.status);
    
    // Initialize tags if they exist, otherwise empty array
    const tags = typeof idea.tags === 'string' 
      ? idea.tags.split(',').map(tag => tag.trim()).filter(tag => tag) 
      : Array.isArray(idea.tags) ? idea.tags : [];
    setEditedTags(tags);
  };

  // Function to close dialog
  const handleCloseEditDialog = () => {
    setEditingIdeaId(null);
  };

  // Function to save edited idea 
  const handleSaveEditedIdea = async () => {
    if (!editingIdeaId) return;

    try {
      const response = await fetch(`/api/ideas/${editingIdeaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedTitle,
          description: editedDescription,
          isPublic: editedIsPublic,
          status: editedStatus,
          tags: editedTags
        }),
        credentials: 'include',  // Include cookies and auth credentials
      });

      const updatedIdea = await response.json();
      
      if (response.ok) {
        // Update idea in state
        setMyIdeas(myIdeas.map(idea => 
          idea.id === editingIdeaId ? updatedIdea : idea
        ));
        
        setCollaboratedIdeas(collaboratedIdeas.map(idea => 
          idea.id === editingIdeaId ? updatedIdea : idea
        ));

        // Close the dialog
        setEditingIdeaId(null);
      } else {
        console.error('Failed to update idea:', updatedIdea.error);
      }
    } catch (error) {
      console.error('Error updating idea:', error);
    }
  };

  // Function to handle creating a new idea
  const handleCreateNewIdea = async () => {
    if (!newIdeaTitle.trim()) {
      // Show an error or alert that title is required
      return;
    }

    try {
      setIsCreatingIdea(true);
      
      // Use the tag array directly instead of parsing from string
      const newIdea = {
        title: newIdeaTitle,
        description: newIdeaDescription,
        is_published: newIdeaIsPublished,
        status: newIdeaStatus,
        tags: tagArray
      };

      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newIdea),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        // Add the new idea to the list and select it
        const createdIdea = data.idea;
        setMyIdeas(prevIdeas => [createdIdea, ...prevIdeas]);
        setSelectedIdeaId(createdIdea.id);
        
        // Reset the form and close the dialog
        resetNewIdeaForm();
        setIsNewIdeaDialogOpen(false);
      } else {
        console.error('Failed to create idea:', data.error);
      }
    } catch (error) {
      console.error('Error creating idea:', error);
    } finally {
      setIsCreatingIdea(false);
    }
  };

  // Function to reset the new idea form
  const resetNewIdeaForm = () => {
    setNewIdeaTitle("");
    setNewIdeaDescription("");
    setNewIdeaIsPublished(false);
    setNewIdeaStatus("draft");
    setNewIdeaTags("");
    setTagArray([]);
  };

  // Function to handle toggling a checklist item's completed status
  const handleToggleChecklistItem = async (checklistId: string, itemId: string, completed: boolean) => {
    try {
      setIdeaChecklists(prevChecklists => {
        return prevChecklists.map(checklist => {
          if (checklist.id !== checklistId) return checklist;
          
          const updatedItems = checklist.checklist_items.map(item => {
            if (item.id !== itemId) return item;
            return { ...item, completed: !completed };
          });
          
          // Update the progress
          const totalItems = updatedItems.length;
          const completedItems = updatedItems.filter(item => item.completed).length;
          const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
          
          return {
            ...checklist,
            checklist_items: updatedItems,
            progress
          };
        });
      });
      
      // Make the API call
      const response = await fetch(`/api/checklists/${checklistId}/items`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          completed: !completed
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update checklist item');
      }
      
      // Fetch the updated checklist to keep everything in sync
      await fetchChecklists();
    } catch (error) {
      console.error('Error toggling checklist item:', error);
    }
  };

  // Function to handle idea publishing
  const handlePublishIdea = async (ideaId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent selection of the idea when clicking publish
    
    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_published: true,
          published_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        // Update the local state to reflect the change
        setMyIdeas(prevIdeas =>
          prevIdeas.map(idea =>
            idea.id === ideaId
              ? { ...idea, is_published: true }
              : idea
          )
        );
      } else {
        console.error('Failed to publish idea');
      }
    } catch (error) {
      console.error('Error publishing idea:', error);
    }
  };

  // Function to handle idea deletion
  const handleDeleteIdea = async (ideaId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent selection of the idea when clicking delete
    
    if (!confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted idea from the state
        setMyIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== ideaId));
        
        // If the deleted idea was selected, clear the selection
        if (selectedIdeaId === ideaId) {
          setSelectedIdeaId(null);
          setIdeaChecklists([]);
        }
      } else {
        console.error('Failed to delete idea');
      }
    } catch (error) {
      console.error('Error deleting idea:', error);
    }
  };

  // Function to handle creating a new checklist
  const handleCreateChecklist = async () => {
    if (!newChecklistTitle.trim()) return;
    
    // Use the selected idea from the dropdown or fall back to the selected idea in the dashboard
    const targetIdeaId = checklistIdeaId || selectedIdeaId;
    
    if (!targetIdeaId) {
      alert("Please select an idea for this checklist");
      return;
    }
    
    try {
      setIsCreatingChecklist(true);
      
      const response = await fetch(`/api/ideas/${targetIdeaId}/checklists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newChecklistTitle,
          isShared: true  // Always create shared checklists
        }),
      });
      
      if (response.ok) {
        const newChecklist = await response.json();
        
        // If creating a checklist for the currently selected idea, update the list
        if (targetIdeaId === selectedIdeaId) {
          setIdeaChecklists(prev => [...prev, newChecklist]);
        }
        
        setNewChecklistTitle('');
        setChecklistIdeaId(null);
        setIsChecklistDialogOpen(false);
      } else {
        console.error('Failed to create checklist');
      }
    } catch (error) {
      console.error('Error creating checklist:', error);
    } finally {
      setIsCreatingChecklist(false);
    }
  };
  
  // Function to handle adding a new checklist item
  const handleAddChecklistItem = async (checklistId: string) => {
    const text = newItemText[checklistId];
    if (!text?.trim()) return;
    
    try {
      setIsAddingItem(prev => ({ ...prev, [checklistId]: true }));
      
      const response = await fetch(`/api/checklists/${checklistId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (response.ok) {
        const newItem = await response.json();
        
        // Add the new item to the appropriate checklist
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
            
            // Recalculate progress
            const totalItems = updatedChecklists[checklistIndex].checklist_items.length;
            const completedItems = updatedChecklists[checklistIndex].checklist_items.filter(
              (item: any) => item.completed
            ).length;
            const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
            
            updatedChecklists[checklistIndex].progress = progress;
          }
          
          return updatedChecklists;
        });
        
        // Clear the input
        setNewItemText(prev => ({ ...prev, [checklistId]: '' }));
      } else {
        console.error('Failed to add checklist item');
      }
    } catch (error) {
      console.error('Error adding checklist item:', error);
    } finally {
      setIsAddingItem(prev => ({ ...prev, [checklistId]: false }));
    }
  };
  
  // Function to handle toggling a checklist item
  const handleToggleItem = async (
    checklistId: string, 
    itemId: string, 
    completed: boolean
  ) => {
    try {
      const response = await fetch(`/api/checklists/${checklistId}/items`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          completed: !completed
        }),
      });
      
      if (response.ok) {
        const updatedItem = await response.json();
        
        // Update the item in the checklist
        setIdeaChecklists(prev => {
          const updatedChecklists = [...prev];
          const checklistIndex = updatedChecklists.findIndex(cl => cl.id === checklistId);
          
          if (checklistIndex !== -1) {
            const itemIndex = updatedChecklists[checklistIndex].checklist_items.findIndex(
              (item: any) => item.id === itemId
            );
            
            if (itemIndex !== -1) {
              const updatedItems = [...updatedChecklists[checklistIndex].checklist_items];
              updatedItems[itemIndex] = updatedItem;
              
              updatedChecklists[checklistIndex] = {
                ...updatedChecklists[checklistIndex],
                checklist_items: updatedItems
              };
              
              // Recalculate progress
              const totalItems = updatedItems.length;
              const completedItems = updatedItems.filter((item: any) => item.completed).length;
              const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
              
              updatedChecklists[checklistIndex].progress = progress;
            }
          }
          
          return updatedChecklists;
        });
      } else {
        console.error('Failed to toggle checklist item');
      }
    } catch (error) {
      console.error('Error toggling checklist item:', error);
    }
  };
  
  // Function to handle deleting a checklist item
  const handleDeleteChecklistItem = async (checklistId: string, itemId: string) => {
    try {
      setIsDeletingItem(prev => ({ ...prev, [itemId]: true }));
      
      const response = await fetch(`/api/checklists/${checklistId}/items?itemId=${itemId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove the item from the checklist
        setIdeaChecklists(prev => {
          const updatedChecklists = [...prev];
          const checklistIndex = updatedChecklists.findIndex(cl => cl.id === checklistId);
          
          if (checklistIndex !== -1) {
            const updatedItems = updatedChecklists[checklistIndex].checklist_items.filter(
              (item: any) => item.id !== itemId
            );
            
            updatedChecklists[checklistIndex] = {
              ...updatedChecklists[checklistIndex],
              checklist_items: updatedItems
            };
            
            // Recalculate progress
            const totalItems = updatedItems.length;
            const completedItems = updatedItems.filter((item: any) => item.completed).length;
            const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
            
            updatedChecklists[checklistIndex].progress = progress;
          }
          
          return updatedChecklists;
        });
      } else {
        console.error('Failed to delete checklist item');
      }
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    } finally {
      setIsDeletingItem(prev => ({ ...prev, [itemId]: false }));
    }
  };
  
  // Function to handle deleting a checklist
  const handleDeleteChecklist = async () => {
    if (!checklistToDeleteId) {
      setIsConfirmDeleteOpen(false);
      return;
    }
    
    try {
      setIsDeletingChecklist(true);
      
      const response = await fetch(`/api/checklists/${checklistToDeleteId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove the checklist from state
        setIdeaChecklists(prev => prev.filter(cl => cl.id !== checklistToDeleteId));
      } else {
        console.error('Failed to delete checklist');
      }
    } catch (error) {
      console.error('Error deleting checklist:', error);
    } finally {
      setIsDeletingChecklist(false);
      setIsConfirmDeleteOpen(false);
      setChecklistToDeleteId(null);
    }
  };



  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header area with page title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ideas & Implementation</h1>
            <p className="text-muted-foreground">Select an idea to view and manage its implementation tasks</p>
          </div>
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ideas section - 1/3 width on large screens */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="my-ideas" className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Ideas</h2>
                <TabsList>
                  <TabsTrigger value="my-ideas">My Ideas</TabsTrigger>
                  <TabsTrigger value="my-picks">My Picks</TabsTrigger>
                  <TabsTrigger value="collaborated">Collaborated</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="my-ideas" className="space-y-0 mt-0">
                <Card>
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <div className="flex justify-between w-full items-center">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Search ideas..."
                          className="h-8 w-[150px] lg:w-[250px]"
                        />
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ListFilter className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-1"
                        onClick={() => setIsNewIdeaDialogOpen(true)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span className="text-xs">Add</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {myIdeas.map((idea) => (
                        <div 
                          key={idea.id}
                          onClick={() => handleIdeaClick(idea)}
                          className={`
                            px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors 
                            ${selectedIdeaId === idea.id ? 'bg-muted' : ''}
                          `}
                        >
                          <div className="flex justify-between mb-1">
                            <h3 className="font-medium text-sm">
                              <Link href={`/ideas/${idea.id}`} className="hover:underline text-primary">
                                {idea.title}
                              </Link>
                              <Badge variant="outline" className="ml-2 text-[10px] font-normal">{idea.upvotes} upvotes</Badge>
                            </h3>
                            <div className="flex items-center gap-1">
                              {!idea.is_published && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-6 px-2 py-0 text-xs"
                                  onClick={(e) => handlePublishIdea(idea.id, e)}
                                >
                                  <EyeIcon className="h-3 w-3 mr-1" />
                                  Publish
                                </Button>
                              )}
                              {idea.is_published && (
                                <Badge className="bg-green-500/10 text-green-500 text-xs hover:bg-green-500/20">
                                  <EyeIcon className="h-3 w-3 mr-1" />
                                  Published
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{idea.description}</p>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center">
                              <Users className="h-3 w-3 text-muted-foreground mr-1" />
                              <span className="text-xs text-muted-foreground">{idea.upvotes} collaborators</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                className={`text-[10px] capitalize px-1.5 py-0 h-4 ${
                                  idea.status === 'Planning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : 
                                  idea.status === 'In Progress' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                  'bg-blue-100 text-blue-800 hover:bg-blue-100'
                                }`}
                              >
                                {idea.status}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditIdea(idea);
                                  }}>
                                    <Pencil className="h-3.5 w-3.5 mr-2" />
                                    <span>Edit Idea</span>
                                  </DropdownMenuItem>
                                  {!idea.is_published && (
                                    <DropdownMenuItem onClick={(e) => handlePublishIdea(idea.id, e)}>
                                      <EyeIcon className="h-3.5 w-3.5 mr-2" />
                                      <span>Publish</span>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={(e) => handleDeleteIdea(idea.id, e)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                    <span>Delete</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="my-picks" className="space-y-0 mt-0">
                <Card>
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <div className="flex justify-between w-full items-center">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Search my picks..."
                          className="h-8 w-[150px] lg:w-[250px]"
                        />
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ListFilter className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {myPicksIdeas.map((idea) => (
                        <div 
                          key={idea.id}
                          onClick={() => handleIdeaClick(idea)}
                          className={`
                            px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors 
                            ${selectedIdeaId === idea.id ? 'bg-muted' : ''}
                          `}
                        >
                          <div className="flex justify-between mb-1">
                            <h3 className="font-medium text-sm">
                              <Link href={`/ideas/${idea.id}`} className="hover:underline text-primary">
                                {idea.title}
                              </Link>
                              <Badge variant="outline" className="ml-2 text-[10px] font-normal">{idea.upvotes} upvotes</Badge>
                            </h3>
                            <Badge className={`text-[10px] capitalize px-1.5 py-0 h-4 
                              ${idea.assignments[0]?.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : 
                                idea.assignments[0]?.status === 'in_progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                                idea.assignments[0]?.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                                'bg-blue-100 text-blue-800 hover:bg-blue-100'
                              }`}
                            >
                              {idea.assignments[0]?.status ? idea.assignments[0].status.replace('_', ' ') : 'Assigned'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{idea.description}</p>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                                <span className="text-xs text-muted-foreground">
                                  {new Date(idea.assignments[0]?.assigned_at || idea.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <Link href={`/users/${idea.creator_id}`} onClick={(e) => e.stopPropagation()}>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Avatar className="h-4 w-4 cursor-pointer">
                                        <AvatarFallback className="text-[8px]">
                                          {idea.users?.display_name?.charAt(0) || idea.creator_id.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{idea.users?.display_name || 'User'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </Link>
                            </div>
                            <Badge 
                              className={`text-[10px] capitalize px-1.5 py-0 h-4 ${
                                idea.status === 'Planning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : 
                                idea.status === 'In Progress' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                'bg-blue-100 text-blue-800 hover:bg-blue-100'
                              }`}
                            >
                              {idea.status}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditIdea(idea);
                                }}>
                                  <Pencil className="h-3.5 w-3.5 mr-2" />
                                  <span>Edit Idea</span>
                                </DropdownMenuItem>
                                <Link 
                                  href={`/ideas/${idea.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                >
                                  <ArrowUpRight className="h-3.5 w-3.5 mr-2" />
                                  <span>Go to Discussion</span>
                                </Link>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="collaborated" className="space-y-0 mt-0">
                <Card>
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <div className="flex justify-between w-full items-center">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Search ideas..."
                          className="h-8 w-[150px] lg:w-[250px]"
                        />
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ListFilter className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {collaboratedIdeas.map((idea) => (
                        <div 
                          key={idea.id}
                          onClick={() => handleIdeaClick(idea)}
                          className={`
                            px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors 
                            ${selectedIdeaId === idea.id ? 'bg-muted' : ''}
                          `}
                        >
                          <div className="flex justify-between mb-1">
                            <h3 className="font-medium text-sm">
                              <Link href={`/ideas/${idea.id}`} className="hover:underline text-primary">
                                {idea.title}
                              </Link>
                              <Badge variant="outline" className="ml-2 text-[10px] font-normal">{idea.upvotes} upvotes</Badge>
                            </h3>
                            <Badge className="text-[10px] capitalize px-1.5 py-0 h-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
                              Public
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{idea.description}</p>
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <Users className="h-3 w-3 text-muted-foreground mr-1" />
                                <span className="text-xs text-muted-foreground">{idea.upvotes} collaborators</span>
                              </div>
                              <div className="flex items-center">
                                <Avatar className="h-4 w-4">
                                  <AvatarFallback className="text-[8px]">{idea.creator_id.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">{idea.creator_id}</span>
                              </div>
                            </div>
                            <Badge 
                              className={`text-[10px] capitalize px-1.5 py-0 h-4 ${
                                idea.status === 'Planning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : 
                                idea.status === 'In Progress' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                'bg-blue-100 text-blue-800 hover:bg-blue-100'
                              }`}
                            >
                              {idea.status}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditIdea(idea);
                                }}>
                                  <Pencil className="h-3.5 w-3.5 mr-2" />
                                  <span>Edit Idea</span>
                                </DropdownMenuItem>
                                <Link 
                                  href={`/ideas/${idea.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                >
                                  <ArrowUpRight className="h-3.5 w-3.5 mr-2" />
                                  <span>Go to Discussion</span>
                                </Link>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Idea Detail & Checklist Section - 2/3 width on large screens */}
          <div className="lg:col-span-2">
            {!selectedIdeaId ? (
              <Card className="w-full h-full flex items-center justify-center p-8">
                <div className="text-center space-y-3">
                  <h3 className="text-lg font-medium">No Idea Selected</h3>
                  <p className="text-muted-foreground">
                    Select an idea from the list to view and manage checklists.
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="w-full h-full flex flex-col">
                <CardHeader className="pb-0">
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      {myIdeas.find(idea => idea.id === selectedIdeaId)?.title || 
                       collaboratedIdeas.find(idea => idea.id === selectedIdeaId)?.title || 
                       myPicksIdeas.find(idea => idea.id === selectedIdeaId)?.title || 
                       'Idea Details'}
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-auto p-4">
                  <Tabs defaultValue="checklists" className="w-full">
                    <TabsList className="mb-2">
                      <TabsTrigger value="checklists">Checklists</TabsTrigger>
                      <TabsTrigger value="assignees">Assignees</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="checklists" className="mt-2">
                      <div className="flex justify-between items-center mb-4">
                        <CardDescription>
                          Implementation checklists for this idea
                        </CardDescription>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 gap-1"
                          onClick={() => {
                            setNewChecklistTitle("");
                            setNewChecklistType("personal");
                            setChecklistIdeaId(selectedIdeaId);
                            setIsChecklistDialogOpen(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span className="text-xs">Add Checklist</span>
                        </Button>
                      </div>
                      {isLoadingChecklists ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin h-8 w-8 border-2 border-current border-t-transparent rounded-full"></div>
                        </div>
                      ) : ideaChecklists.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                          <div className="rounded-full bg-background p-3 border">
                            <CheckSquare className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium">No Checklists Found</h3>
                          <p className="text-muted-foreground max-w-md">
                            Start tracking implementation tasks by creating your first checklist.
                          </p>
                          <Button 
                            onClick={() => {
                              setNewChecklistTitle("");
                              setNewChecklistType("personal");
                              setChecklistIdeaId(selectedIdeaId);
                              setIsChecklistDialogOpen(true);
                            }}
                        className="mt-2"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Checklist
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ideaChecklists.map((checklist) => (
                        <div 
                          key={checklist.id} 
                          className="border rounded-lg overflow-hidden bg-card">
                          <div className="flex items-center justify-between p-4 bg-muted/30">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-sm">{checklist.title}</h3>
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                {Math.round(checklist.progress)}% Complete
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive/70 hover:text-destructive"
                              onClick={() => {
                                setChecklistToDeleteId(checklist.id);
                                setIsConfirmDeleteOpen(true);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" x2="10" y1="11" y2="17" />
                                <line x1="14" x2="14" y1="11" y2="17" />
                              </svg>
                            </Button>
                          </div>
                          <div className="p-4">
                            <ul className="space-y-2 mb-4">
                              {checklist.checklist_items.map((item: any) => (
                                <li key={item.id} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={() => handleToggleChecklistItem(
                                      checklist.id,
                                      item.id,
                                      item.completed
                                    )}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                                    {item.text}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteChecklistItem(checklist.id, item.id)}
                                    disabled={isDeletingItem[item.id]}
                                  >
                                    {isDeletingItem[item.id] ? (
                                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 6 6 18" />
                                        <path d="m6 6 12 12" />
                                      </svg>
                                    )}
                                  </Button>
                                </li>
                              ))}
                            </ul>
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Add new item..."
                                value={newItemText[checklist.id] || ''}
                                onChange={(e) => setNewItemText(prev => ({ ...prev, [checklist.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newItemText[checklist.id]?.trim()) {
                                    e.preventDefault();
                                    handleAddChecklistItem(checklist.id);
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() => handleAddChecklistItem(checklist.id)}
                                disabled={isAddingItem[checklist.id] || !newItemText[checklist.id]?.trim()}
                              >
                                {isAddingItem[checklist.id] ? (
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  "Add"
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="assignees" className="space-y-4 mt-2">
                      <div className="flex justify-between items-center">
                        <CardDescription>People working on this idea</CardDescription>
                      </div>
                      
                      {/* Idea Creator */}
                      <div className="border rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2">Creator</h3>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const selectedIdea = 
                              myIdeas.find(idea => idea.id === selectedIdeaId) || 
                              collaboratedIdeas.find(idea => idea.id === selectedIdeaId) || 
                              myPicksIdeas.find(idea => idea.id === selectedIdeaId);
                              
                            return (
                              <div className="flex items-center space-x-2">
                                <Link href={`/users/${selectedIdea?.creator_id}`}>
                                  <Avatar className="h-8 w-8 cursor-pointer">
                                    <AvatarFallback>
                                      {selectedIdea?.users?.display_name?.charAt(0) || selectedIdea?.creator_id?.charAt(0) || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                </Link>
                                <div>
                                  <Link href={`/users/${selectedIdea?.creator_id}`} className="hover:underline">
                                    <p className="text-sm font-medium">{selectedIdea?.users?.display_name || 'User'}</p>
                                  </Link>
                                  <p className="text-xs text-muted-foreground">Creator</p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      
                      {/* Assignees */}
                      <div className="border rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2">Assignees</h3>
                        {(() => {
                          const selectedIdea = 
                            myIdeas.find(idea => idea.id === selectedIdeaId) || 
                            collaboratedIdeas.find(idea => idea.id === selectedIdeaId) || 
                            myPicksIdeas.find(idea => idea.id === selectedIdeaId);
                            
                          if (!selectedIdea?.assignments || selectedIdea.assignments.length === 0) {
                            return (
                              <div className="text-sm text-muted-foreground py-2">
                                No one is currently assigned to this idea.
                              </div>
                            );
                          }
                          
                          return selectedIdea.assignments.map(assignment => (
                            <div key={assignment.id} className="flex items-center justify-between py-2 border-t first:border-t-0">
                              <div className="flex items-center space-x-2">
                                <Link href={`/users/${assignment.user_id}`}>
                                  <Avatar className="h-6 w-6 cursor-pointer">
                                    <AvatarFallback className="text-xs">{(assignment.assignee?.display_name || assignment.user_id).charAt(0)}</AvatarFallback>
                                  </Avatar>
                                </Link>
                                <div>
                                  <Link href={`/users/${assignment.user_id}`} className="hover:underline">
                                    <p className="text-sm">{assignment.assignee?.display_name || assignment.user_id}</p>
                                  </Link>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(assignment.assigned_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Badge className={`text-[10px] capitalize px-1.5 py-0 h-4 
                                ${assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                  assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-green-100 text-green-800'}
                              `}>
                                {assignment.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          ));
                        })()}
                      </div>
                      
                      {/* Collaborators */}
                      <div className="border rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2">Collaborators</h3>
                        <div className="text-sm text-muted-foreground">
                          Coming soon: Track people collaborating on your ideas.
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Idea Dialog */}
      <Dialog open={editingIdeaId !== null} onOpenChange={(open: boolean) => !open && handleCloseEditDialog()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Idea</DialogTitle>
            <DialogDescription>
              Make changes to your idea details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={editedTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={editedDescription}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedDescription(e.target.value)}
                className="col-span-3"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Select value={editedStatus} onValueChange={setEditedStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-tags" className="text-right">
                Tags
              </Label>
              <div className="col-span-3">
                <TagInput
                  tags={editedTags}
                  setTags={setEditedTags}
                  suggestions={["technology", "ai", "project", "design", "development", "feature", "bug", "enhancement", "mobile", "web"]}
                  placeholder="Add tags (press Enter or comma to add)"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="visibility" className="text-right">
                Visibility
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="visibility"
                  checked={editedIsPublic}
                  onCheckedChange={setEditedIsPublic}
                />
                <Label htmlFor="visibility" className="cursor-pointer">
                  {editedIsPublic ? "Public" : "Private"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Link 
              href={editingIdeaId ? `/ideas/${editingIdeaId}` : "#"} 
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleCloseEditDialog}
            >
              <ArrowUpRight className="h-4 w-4" />
              Go to Discussion
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCloseEditDialog}>Cancel</Button>
              <Button onClick={handleSaveEditedIdea}>Save changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Idea Dialog */}
      <Dialog open={isNewIdeaDialogOpen} onOpenChange={(open) => {
        setIsNewIdeaDialogOpen(open);
        if (!open) resetNewIdeaForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
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
              <div className="col-span-3">
                <Select value={newIdeaStatus} onValueChange={setNewIdeaStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-tags" className="text-right">
                Tags
              </Label>
              <div className="col-span-3">
                <TagInput
                  tags={tagArray}
                  setTags={setTagArray}
                  suggestions={["technology", "ai", "project", "design", "development", "feature", "bug", "enhancement", "mobile", "web"]}
                  placeholder="Add tags (press Enter or comma to add)"
                />
              </div>
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
      
      {/* Checklist Delete Confirmation Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this checklist?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All items in this checklist will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsConfirmDeleteOpen(false);
                setChecklistToDeleteId(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteChecklist}
              disabled={isDeletingChecklist}
            >
              {isDeletingChecklist ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete Checklist"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checklist Creation Dialog */}
      <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a New Checklist</DialogTitle>
            <DialogDescription>
              Create a checklist to track tasks for an idea. 
              Personal checklists are only visible to you, while shared checklists are visible to all collaborators.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="checklist-idea" className="text-right">
                Idea
              </Label>
              <select
                id="checklist-idea"
                value={checklistIdeaId || ""}
                onChange={(e) => setChecklistIdeaId(e.target.value)}
                className="col-span-3 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select an idea</option>
                <optgroup label="My Ideas">
                  {myIdeas.map((idea) => (
                    <option key={idea.id} value={idea.id}>
                      {idea.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="My Picks">
                  {myPicksIdeas.map((idea) => (
                    <option key={idea.id} value={idea.id}>
                      {idea.title} (Assigned)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Collaborated">
                  {collaboratedIdeas.map((idea) => (
                    <option key={idea.id} value={idea.id}>
                      {idea.title} (Collaborated)
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="checklist-title" className="text-right">
                Title
              </Label>
              <Input
                id="checklist-title"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                className="col-span-3"
                placeholder="Enter checklist title"
              />
            </div>
            {/* Type selection removed */}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewChecklistTitle("")}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateChecklist}
              disabled={isCreatingChecklist || !newChecklistTitle.trim() || !checklistIdeaId}
            >
              {isCreatingChecklist ? "Creating..." : "Create Checklist"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default DashboardPage;
