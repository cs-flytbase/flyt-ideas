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
  Trophy,
  Trash2,
  AlertCircle
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
  assignments?: any[];
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
  
  // State for posts management
  const [posts, setPosts] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  
  // State for selected idea and checklists
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [ideaChecklists, setIdeaChecklists] = useState<Checklist[]>([]);
  const [isLoadingChecklists, setIsLoadingChecklists] = useState(false);
  
  // Basic state management (placeholder example)
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false);
  
  // Get user data from context
  const { user } = useUser();
  
  // Function to fetch posts
  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true);
      const response = await fetch('/api/posts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
        
        // Filter my posts if user is logged in
        if (user?.id) {
          setMyPosts(data.posts.filter((post: any) => post.creator_id === user.id) || []);
        }
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    // Fetch posts when component mounts
    fetchPosts();
    
    // Fetch other data like ideas
    // ... other fetch code
  }, [user]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        {/* Basic placeholder dashboard */}
        <Tabs defaultValue="ideas" className="w-full">
          <TabsList>
            <TabsTrigger value="ideas">Ideas</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>
          
          {/* Ideas tab content */}
          <TabsContent value="ideas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myIdeas.map(idea => (
                <Card key={idea.id}>
                  <CardHeader>
                    <CardTitle>{idea.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{idea.description}</p>
                  </CardContent>
                </Card>
              ))}
              
              {myIdeas.length === 0 && (
                <div className="col-span-3 py-8 text-center">
                  <p className="text-muted-foreground">No ideas found</p>
                  <Button className="mt-4">Create an Idea</Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Posts tab content */}
          <TabsContent value="posts">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map(post => (
                <Card key={post.id}>
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{post.content?.substring(0, 100)}...</p>
                    <div className="mt-4 flex justify-between">
                      <Link href={`/posts/${post.id}`}>
                        <Button variant="outline" size="sm">View Post</Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setEditingPostId(post.id);
                          setIsEditingPost(true);
                        }}
                      >
                        Edit Post
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {posts.length === 0 && (
                <div className="col-span-3 py-8 text-center">
                  <p className="text-muted-foreground">No posts found</p>
                  <Button className="mt-4">Create a Post</Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
