"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import { useUser, UserButton } from "@clerk/nextjs";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Loader2, 
  Filter,
  Plus,
  Search
} from "lucide-react";
import Link from "next/link";

// Type for a post
interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  creator_id: string;
  is_public: boolean;
  upvotes: number;
  created_at: string;
  updated_at: string;
  creator: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
  comments: { count: number }[];
}

const PostsPage = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  
  // State for posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  // State for new post creation
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostDescription, setNewPostDescription] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostIsPublic, setNewPostIsPublic] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
  // State for votes
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [isVoting, setIsVoting] = useState<Record<string, boolean>>({});
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query to avoid too many API requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch posts when component mounts or when search/tab changes
  useEffect(() => {
    fetchPosts();
  }, [activeTab, isUserLoaded, debouncedSearchQuery]);

  // Function to fetch posts
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      let url = '/api/posts';
      const params = new URLSearchParams();
      
      if (activeTab === 'mine' && isUserLoaded && user) {
        params.append('onlyMine', 'true');
      }
      
      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery);
      }
      
      // Add params to URL if any are set
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setPosts(data);
        
        // If user is logged in, fetch their votes for each post
        if (isUserLoaded && user) {
          const votes: Record<string, number> = {};
          for (const post of data) {
            try {
              const voteResponse = await fetch(`/api/posts/${post.id}/vote`);
              if (voteResponse.ok) {
                const voteData = await voteResponse.json();
                if (voteData.vote) {
                  votes[post.id] = voteData.vote.vote_type;
                }
              }
            } catch (err) {
              console.error(`Error fetching vote for post ${post.id}:`, err);
            }
          }
          setUserVotes(votes);
        }
      } else {
        console.error('Failed to fetch posts:', data.error);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    fetchPosts();
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  // Function to handle creating a new post
  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !isUserLoaded || !user) return;
    
    try {
      setIsCreatingPost(true);
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newPostTitle,
          description: newPostDescription,
          content: newPostContent,
          is_public: newPostIsPublic
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add the new post with creator information
        const newPost: Post = {
          ...data,
          // Make sure creator is always defined
          creator: {
            id: user.id,
            display_name: user.fullName || user.username || 'Anonymous',
            avatar_url: user.imageUrl || ''
          },
          comments: [{ count: 0 }]
        };
        
        setPosts(prev => [newPost, ...prev]);
        resetNewPostForm();
        setIsNewPostDialogOpen(false);
      } else {
        console.error('Failed to create post:', data.error);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Function to reset the new post form
  const resetNewPostForm = () => {
    setNewPostTitle("");
    setNewPostDescription("");
    setNewPostContent("");
    setNewPostIsPublic(true);
  };

  // Function to handle voting on a post
  const handleVote = async (postId: string, voteType: number) => {
    if (!isUserLoaded || !user) return;
    
    try {
      setIsVoting(prev => ({ ...prev, [postId]: true }));
      
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote_type: voteType }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the post with the new upvote count
        setPosts(prev => 
          prev.map(post => 
            post.id === postId ? { ...post, upvotes: data.upvotes } : post
          )
        );
        
        // Update the user's vote for this post
        if (data.action === 'removed') {
          setUserVotes(prev => {
            const updated = { ...prev };
            delete updated[postId];
            return updated;
          });
        } else {
          setUserVotes(prev => ({
            ...prev,
            [postId]: voteType
          }));
        }
      }
    } catch (error) {
      console.error('Error voting on post:', error);
    } finally {
      setIsVoting(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Function to get initials from a name
  const getInitials = (name: string): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <MainLayout>
      <div className="px-4 py-6 md:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Posts</h1>
            <p className="text-muted-foreground">
              Share ideas and get feedback from the community
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
              onClick={() => setIsNewPostDialogOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Create Post
            </Button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Search className="text-primary h-5 w-5" />
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search posts by title, description, or content..."
                className="w-full rounded-md border-0 bg-transparent px-3 py-2 text-base shadow-none focus:outline-none focus:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {searchQuery && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={clearSearch}
                className="h-9 px-2"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="h-4 w-4"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span className="sr-only">Clear search</span>
              </Button>
            )}
            <Button 
              type="submit" 
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
              disabled={isSearching}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </form>

        <Tabs defaultValue={activeTab} className="space-y-4" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="mine" disabled={!isUserLoaded || !user}>My Posts</TabsTrigger>
            </TabsList>
            {debouncedSearchQuery && (
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">
                  Showing results for "{debouncedSearchQuery}"
                </span>
                <Button variant="outline" size="sm" onClick={clearSearch}>
                  Clear
                </Button>
              </div>
            )}
          </div>
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    userVote={userVotes[post.id]}
                    isVoting={isVoting[post.id]}
                    onVote={handleVote}
                    isUserLoaded={isUserLoaded}
                    user={user}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No posts yet</h3>
                <p className="mt-2 text-sm text-muted-foreground mb-4">Be the first to share something with the community!</p>
                <Button onClick={() => setIsNewPostDialogOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" /> Create a Post
                </Button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="mine" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    userVote={userVotes[post.id]}
                    isVoting={isVoting[post.id]}
                    onVote={handleVote}
                    isUserLoaded={isUserLoaded}
                    user={user}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">You haven't created any posts yet</h3>
                <p className="mt-2 text-sm text-muted-foreground mb-4">Share your thoughts with the community!</p>
                <Button onClick={() => setIsNewPostDialogOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" /> Create a Post
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* New Post Dialog */}
      <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create a New Post</DialogTitle>
            <DialogDescription>
              Share your thoughts, ideas, or questions with the community
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Give your post a descriptive title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Summary</Label>
              <Input
                id="description"
                placeholder="Briefly describe what your post is about"
                value={newPostDescription}
                onChange={(e) => setNewPostDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your post content here..."
                className="min-h-[150px]"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={newPostIsPublic}
                onCheckedChange={setNewPostIsPublic}
              />
              <Label htmlFor="public">Make this post public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetNewPostForm}>
              Cancel
            </Button>
            <Button onClick={handleCreatePost} disabled={!newPostTitle.trim() || isCreatingPost}>
              {isCreatingPost ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Post"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

// Post Card Component
interface PostCardProps {
  post: Post;
  userVote: number | undefined;
  isVoting: boolean | undefined;
  onVote: (postId: string, voteType: number) => void;
  isUserLoaded: boolean;
  user: any;
}

const PostCard = ({ post, userVote, isVoting, onVote, isUserLoaded, user }: PostCardProps) => {
  // Create a fallback if post.creator is missing
  const creatorName = post.creator?.display_name || 'Unknown User';
  const creatorInitial = (creatorName.charAt(0) || 'U').toUpperCase();
  
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 space-y-2">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            {post.creator?.avatar_url ? (
              <AvatarImage src={post.creator.avatar_url} alt={creatorName} />
            ) : (
              <AvatarFallback>{creatorInitial}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="font-medium">{creatorName}</div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
        <Link href={`/posts/${post.id}`} className="group">
          <CardTitle className="text-xl group-hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
        </Link>
        {isUserLoaded && user && post.creator?.id === user.id && (
          <div>
            <Badge variant="outline" className="text-xs">Your Post</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground line-clamp-2">{post.description}</p>
        {post.content && post.content.length > 0 && (
          <div className="mt-3">
            <p className="line-clamp-3 text-sm">{post.content}</p>
            {post.content.length > 150 && (
              <Link href={`/posts/${post.id}`} className="text-xs text-primary font-medium mt-2 inline-block hover:underline">
                Read more
              </Link>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/20 pt-3 pb-3 flex justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full p-0 w-8 h-8 ${userVote === 1 ? "text-primary bg-primary/10" : ""}`}
            onClick={() => onVote(post.id, 1)}
            disabled={!isUserLoaded || !user || isVoting}
          >
            {isVoting && userVote === 1 ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ThumbsUp className="h-4 w-4" />
            )}
          </Button>
          <span className="text-sm">{post.upvotes > 0 ? post.upvotes : ''}</span>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full p-0 w-8 h-8 ${userVote === -1 ? "text-destructive bg-destructive/10" : ""}`}
            onClick={() => onVote(post.id, -1)}
            disabled={!isUserLoaded || !user || isVoting}
          >
            {isVoting && userVote === -1 ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ThumbsDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Link href={`/posts/${post.id}`}>
          <Button variant="ghost" size="sm" className="hover:bg-muted">
            <MessageSquare className="mr-1 h-4 w-4" />
            <span className="text-sm">
              {post.comments && post.comments[0] ? post.comments[0].count : 0}
            </span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default PostsPage;
