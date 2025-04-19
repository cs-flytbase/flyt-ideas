"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpRight,
  EyeIcon,
  EyeOffIcon,
  ListFilter,
  MoreHorizontal,
  Pencil,
  Plus,
  Users
} from "lucide-react";

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
  users?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface IdeaListProps {
  ideas: Idea[];
  selectedIdeaId: string | null;
  onIdeaClick: (idea: Idea) => void;
  onEditIdea: (idea: Idea) => void;
  onPublishIdea: (ideaId: string, event: React.MouseEvent) => void;
  onNewIdeaClick: () => void;
}

export function IdeaList({
  ideas,
  selectedIdeaId,
  onIdeaClick,
  onEditIdea,
  onPublishIdea,
  onNewIdeaClick
}: IdeaListProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 flex flex-row items-center justify-between space-y-0">
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
            onClick={onNewIdeaClick}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="text-xs">Add</span>
          </Button>
        </div>

        <div className="divide-y divide-border">
          {ideas.map((idea) => (
            <div 
              key={idea.id}
              onClick={() => onIdeaClick(idea)}
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
                  <div className="flex items-center gap-1">
                    <Avatar className="h-4 w-4">
                      {idea.users?.avatar_url ? (
                        <img src={idea.users.avatar_url} alt={idea.users.display_name} />
                      ) : (
                        <AvatarFallback className="text-[8px]">
                          {idea.users?.display_name ? idea.users.display_name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {idea.users?.display_name || 'Unknown User'}
                    </span>
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
                      onEditIdea(idea);
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

          {ideas.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No ideas found</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onNewIdeaClick}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Idea
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
