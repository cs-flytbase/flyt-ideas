"use client";

import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
// Custom utility to strip markdown for post previews
const stripMarkdown = (text: string) => {
  if (!text) return '';
  
  return text
    // Remove headers (# Header)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markers
    .replace(/[\*_]{1,3}([^*_]+)[\*_]{1,3}/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove links but keep text [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images ![]()
    .replace(/!\[([^\]]+)\]\([^)]+\)/g, '')
    // Remove horizontal rules
    .replace(/^---$/gm, '')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Keep newlines but remove extra whitespace
    .replace(/\s{2,}/g, ' ')
    .trim();
};
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
  ArrowUp, 
  ArrowDown, 
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
      console.log('Fetching posts...');
      
      // In a real app, we would filter by tab 
      const response = await fetch('/api/posts');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Posts data received:', data);
      
      if (data && Array.isArray(data.posts)) {
        console.log(`Found ${data.posts.length} posts`);
        setPosts(data.posts);
      } else if (data && Array.isArray(data)) {
        // Handle case where API might return array directly
        console.log(`Found ${data.length} posts (direct array)`);
        setPosts(data);
      } else {
        console.error('Unexpected data format for posts:', data);
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
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
      {/* Add Toaster to render toast notifications */}
      <Toaster />
      
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
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
      case 'slack':
        // Implement proper Slack sharing based on your requirements
        window.open(`https://slack.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
        toast({
          title: "Shared on Slack",
          description: "Post has been shared to Slack successfully",
          variant: "default",
        });
        break;
      case 'copy':
      default:
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            toast({
              title: "Link copied",
              description: "Link has been copied to clipboard",
              variant: "default",
            });
          })
          .catch(error => {
            console.error('Failed to copy: ', error);
            toast({
              title: "Error",
              description: "Failed to copy link to clipboard",
              variant: "destructive",
            });
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
    <Card className="h-full flex flex-col overflow-hidden border-border/40 hover:border-border transition-all duration-200 hover:shadow-lg shadow-sm">
      <CardHeader className="pb-3 bg-muted/20">
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
      
      <CardContent className="pb-4 flex-grow">
        <div>
          <Link href={`/posts/${post.id}`} className="hover:underline">
            <CardTitle className="text-xl mb-2 line-clamp-2 text-primary/90 hover:text-primary transition-colors">{post.title}</CardTitle>
          </Link>
          
          <CardDescription className="line-clamp-3 mb-4 text-foreground/80 whitespace-pre-line">
            {(() => {
              const content = stripMarkdown(post.description || (post.content ? post.content : ''));
              return content.length > 150 ? content.substring(0, 150) + '...' : content;
            })()}
          </CardDescription>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs bg-primary/5 hover:bg-primary/10 transition-colors">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3 flex justify-between items-center bg-muted/5">
        <div className="flex items-center gap-2">
          {/* Vote buttons - Reddit style pill */}
          <div className="flex items-center bg-muted/50 rounded-full py-1 px-3">
            <button
              className="flex items-center px-1"
              onClick={() => isUserLoaded && onVote(post.id, 1)}
              disabled={isVoting}
            >
              {isVoting && userVote === 1 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className={`h-4 w-4 mr-1 ${userVote === 1 ? 'text-orange-500' : ''}`} />
              )}
            </button>
            
            <span className="text-xs font-medium">{post.upvotes || 0}</span>
            
            <div className="mx-2 h-4 border-r border-muted"></div>
            
            <button
              className="flex items-center px-1"
              onClick={() => isUserLoaded && onVote(post.id, -1)}
              disabled={isVoting}
            >
              {isVoting && userVote === -1 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowDown className={`h-4 w-4 ${userVote === -1 ? 'text-blue-500' : ''}`} />
              )}
            </button>
          </div>
          
          {/* Comments button */}
          <Link href={`/posts/${post.id}`} className="flex items-center gap-1 bg-muted/50 rounded-full py-1 px-3">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs font-medium">{post.comments ? post.comments.length : 0}</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Share on Slack button with dialog */}
          <AlertDialog open={shareOpen} onOpenChange={setShareOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Share2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Share this post</AlertDialogTitle>
                <AlertDialogDescription>
                  Share this post on Slack or copy the link.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex flex-col gap-4 py-4">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center bg-[#4A154B] text-white hover:bg-[#611f64]"
                  onClick={() => handleShare('slack')}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.52 13.71c0 1.28-1.04 2.32-2.32 2.32s-2.32-1.04-2.32-2.32 1.04-2.32 2.32-2.32h2.32v2.32zm1.17 0c0-1.28 1.04-2.32 2.32-2.32s2.32 1.04 2.32 2.32v5.82c0 1.28-1.04 2.32-2.32 2.32s-2.32-1.04-2.32-2.32v-5.82zm2.32-9.37c-1.28 0-2.32-1.04-2.32-2.32S8.73 0 10.01 0s2.32 1.04 2.32 2.32v2.32h-2.32zm0 1.17c1.28 0 2.32 1.04 2.32 2.32s-1.04 2.32-2.32 2.32H4.2c-1.28 0-2.32-1.04-2.32-2.32S2.92 4.51 4.2 4.51h5.82zM17.48 10.01c0-1.28 1.04-2.32 2.32-2.32s2.32 1.04 2.32 2.32-1.04 2.32-2.32 2.32h-2.32v-2.32zm-1.17 0c0 1.28-1.04 2.32-2.32 2.32s-2.32-1.04-2.32-2.32V4.2c0-1.28 1.04-2.32 2.32-2.32s2.32 1.04 2.32 2.32v5.82zm-2.32 9.37c1.28 0 2.32 1.04 2.32 2.32s-1.04 2.32-2.32 2.32-2.32-1.04-2.32-2.32v-2.32h2.32zm0-1.17c-1.28 0-2.32-1.04-2.32-2.32s1.04-2.32 2.32-2.32h5.82c1.28 0 2.32 1.04 2.32 2.32s-1.04 2.32-2.32 2.32h-5.82z" />
                  </svg>
                  Share on Slack
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center justify-start"
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
            variant="secondary"
            size="icon"
            className="rounded-full ml-2 bg-primary/10 hover:bg-primary/20 text-primary"
            asChild
          >
            <Link href={`/posts/${post.id}`}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostsPage;
