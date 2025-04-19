"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { useUser, UserButton } from "@clerk/nextjs";
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Loader2, 
  Filter,
  Plus,
  Search,
  Share2,
  BookmarkIcon,
  MoreHorizontal,
  Heart,
  ArrowUpCircle,
  Facebook,
  Twitter,
  Link as LinkIcon
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
  
  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
    if (isUserLoaded && user) {
      fetchUserVotes();
    }
  }, [isUserLoaded, user]);
  
  // Fetch posts based on active tab
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, we would filter by tab 
      const response = await fetch('/api/posts');
      const data = await response.json();
      
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch the user's votes on posts
  const fetchUserVotes = async () => {
    try {
      const response = await fetch('/api/votes');
      if (response.ok) {
        const data = await response.json();
        
        // Create a mapping of post IDs to vote values
        const voteMap: Record<string, number> = {};
        data.votes.forEach((vote: any) => {
          voteMap[vote.post_id] = vote.vote_type;
        });
        
        setUserVotes(voteMap);
      }
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };
  
  // Create a new post
  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !isUserLoaded) return;
    
    try {
      setIsCreatingPost(true);
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newPostTitle.trim(),
          description: newPostDescription.trim(),
          content: newPostContent.trim(),
          is_public: newPostIsPublic,
        }),
      });
      
      if (response.ok) {
        // Clear the form and close the dialog
        setNewPostTitle('');
        setNewPostDescription('');
        setNewPostContent('');
        setIsNewPostDialogOpen(false);
        
        // Refetch posts to include the new one
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsCreatingPost(false);
    }
  };
  
  // Handle voting on a post
  const handleVote = async (postId: string, voteType: number) => {
    if (!isUserLoaded || !user) return;
    
    // Optimistically update UI
    setIsVoting({ ...isVoting, [postId]: true });
    
    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote_type: voteType }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Update the post's upvotes count
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return { ...post, upvotes: data.upvotes };
          }
          return post;
        }));
        
        // Update the user's vote
        if (data.action === 'removed') {
          setUserVotes({ ...userVotes, [postId]: 0 });
        } else {
          setUserVotes({ ...userVotes, [postId]: voteType });
        }
      }
    } catch (error) {
      console.error('Error voting on post:', error);
    } finally {
      setIsVoting({ ...isVoting, [postId]: false });
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Posts</h1>
            <p className="text-muted-foreground">Share your thoughts and ideas with the community</p>
          </div>
          
          <Button onClick={() => setIsNewPostDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>
        
        <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
          <button
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === 'all' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          
          <button
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === 'following' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
            onClick={() => setActiveTab('following')}
          >
            Following
          </button>
          
          <button
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${activeTab === 'popular' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
            onClick={() => setActiveTab('popular')}
          >
            Popular
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-background">
            <h3 className="text-lg font-medium">No posts yet</h3>
            <p className="text-muted-foreground mt-1">Be the first to create a post!</p>
            <Button className="mt-4" onClick={() => setIsNewPostDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
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
        )}
      </div>
      
      {/* New Post Dialog */}
      <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create a new post</DialogTitle>
            <DialogDescription>
              Share your thoughts, ideas, or questions with the community.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Give your post a title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Brief description (optional)</Label>
              <Input
                id="description"
                placeholder="Add a brief description"
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
                id="is-public"
                checked={newPostIsPublic}
                onCheckedChange={setNewPostIsPublic}
              />
              <Label htmlFor="is-public">Make this post public</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPostDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={!newPostTitle.trim() || isCreatingPost}
            >
              {isCreatingPost ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Post'
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
  const [shareOpen, setShareOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);
  
  // Extract tags if they exist in the description (simulate tags for demo)
  const extractTags = (text: string) => {
    const tagRegex = /#(\w+)/g;
    const matches = text.match(tagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  };
  
  const tags = extractTags(post.description || post.content || '');
  
  const handleShare = (platform: string = 'copy') => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/posts/${post.id}` : '';
    const shareTitle = post.title || 'Check out this post!';
    
    switch(platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'copy':
      default:
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            alert('Link copied to clipboard!');
          })
          .catch(err => {
            console.error('Failed to copy: ', err);
          });
        break;
    }
    
    setShareOpen(false);
  };
  
  // Add heart animation effect
  const handleHeartClick = () => {
    if (!animateHeart) {
      setAnimateHeart(true);
      setTimeout(() => setAnimateHeart(false), 1000);
    }
  };

  return (
    <Card className="mb-6 overflow-hidden border-border/40 hover:border-border transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 ring-2 ring-background ring-offset-2 ring-offset-primary/10">
              <AvatarImage src={post.creator?.avatar_url} alt={post.creator?.display_name} />
              <AvatarFallback>
                {post.creator?.display_name?.substring(0, 2).toUpperCase() || 'UN'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/users/${post.creator_id}`} className="text-sm font-semibold hover:underline">
                {post.creator?.display_name}
              </Link>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isUserLoaded && user && post.creator_id === user.id && (
                <>
                  <DropdownMenuItem>
                    <Link href={`/posts/${post.id}/edit`} className="w-full">Edit post</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete post</DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => setShareOpen(true)}>Share</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSaved(!saved)}>
                {saved ? 'Unsave' : 'Save'} post
              </DropdownMenuItem>
              <DropdownMenuItem>Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <Link href={`/posts/${post.id}`} className="block group">
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
        </Link>
        
        <p className="text-muted-foreground mb-4">
          {post.description || post.content?.substring(0, 150) + (post.content?.length > 150 ? '...' : '')}
        </p>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 my-3">
            {tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-3 flex justify-between items-center bg-muted/10">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full px-3 ${userVote === 1 ? 'text-primary bg-primary/10' : 'hover:bg-primary/5'}`}
            onClick={() => isUserLoaded && onVote(post.id, 1)}
            disabled={!isUserLoaded || isVoting}
          >
            <ArrowUpCircle className="h-4 w-4 mr-1.5" />
            <span className="font-medium">{post.upvotes || 0}</span>
          </Button>
          
          <Link 
            href={`/posts/${post.id}`} 
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors rounded-full px-3 py-1.5 hover:bg-muted/50"
          >
            <MessageSquare className="h-4 w-4 mr-1.5" />
            <span className="font-medium text-xs">{post.comments?.length || 0}</span>
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-3 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400"
            onClick={handleHeartClick}
          >
            <Heart className={`h-4 w-4 mr-1.5 ${animateHeart ? 'animate-pulse text-red-500' : ''}`} />
            <span className="font-medium text-xs">Like</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-1">
          <AlertDialog open={shareOpen} onOpenChange={setShareOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full px-3">
                <Share2 className="h-4 w-4 mr-1.5" />
                <span className="font-medium text-xs">Share</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Share this post</AlertDialogTitle>
                <AlertDialogDescription>
                  Choose how you'd like to share this post.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center"
                  onClick={() => handleShare('facebook')}
                >
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center"
                  onClick={() => handleShare('twitter')}
                >
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center justify-start col-span-2"
                  onClick={() => handleShare('copy')}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full px-3 ${saved ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950' : ''}`}
            onClick={() => setSaved(!saved)}
          >
            <BookmarkIcon className="h-4 w-4 mr-1.5" />
            <span className="font-medium text-xs">{saved ? 'Saved' : 'Save'}</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="rounded-full ml-2"
            asChild
          >
            <Link href={`/posts/${post.id}`}>Read more</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostsPage;
