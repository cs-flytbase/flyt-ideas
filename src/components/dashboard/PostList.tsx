"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowUp, ArrowDown, MessageSquare, Share, Edit, Plus } from "lucide-react";

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

interface PostListProps {
  posts: Post[];
  selectedPostId?: string | null;
  onPostClick?: (post: Post) => void;
  onEditPost: (post: Post) => void;
  onCreatePost: () => void;
  isMyPosts?: boolean;
}

export function PostList({
  posts,
  selectedPostId,
  onPostClick,
  onEditPost,
  onCreatePost,
  isMyPosts = false
}: PostListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{isMyPosts ? "My Posts" : "All Posts"}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onCreatePost}
          className="flex items-center gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Post</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
              <Link 
                href={`/posts/${post.id}`}
                className="hover:underline"
                onClick={(e) => onPostClick && onPostClick(post)}
              >
                <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
              </Link>
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarFallback className="text-[10px]">
                    {post.creator?.display_name?.charAt(0) || post.creator_id.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">
                  {post.creator?.display_name || post.creator_id}
                </span>
                <span className="mx-1">•</span>
                <span className="text-xs">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-2">
              <p className="text-sm line-clamp-3 mb-3">
                {post.description || post.content.substring(0, 150)}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs ml-1">{post.upvotes}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs ml-1">{post.comments_count || 0}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Link href={`/posts/${post.id}`}>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Share className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={() => onEditPost(post)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {posts.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">No posts found</p>
          <Button 
            variant="outline"
            size="sm"
            onClick={onCreatePost}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Post
          </Button>
        </Card>
      )}
    </div>
  );
}
