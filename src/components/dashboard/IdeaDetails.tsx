"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { CheckSquare, PlusCircle, X, Trash2 } from "lucide-react";

interface Assignee {
  id: string;
  user_id: string;
  status: string;
  assigned_at: string;
  completed_at?: string;
  assignee?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
}

interface Checklist {
  id: string;
  title: string;
  progress: number;
  checklist_items: ChecklistItem[];
  is_shared: boolean;
  owner?: {
    display_name: string;
    avatar_url: string;
  };
}

interface Idea {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  is_public: boolean;
  assignments?: Assignee[];
  users?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface IdeaDetailsProps {
  selectedIdea?: Idea | null;
  checklists: Checklist[];
  isLoadingChecklists: boolean;
  onCreateChecklist: () => void;
  onAddChecklistItem: (checklistId: string, text: string) => Promise<void>;
  onToggleChecklistItem: (checklistId: string, itemId: string, completed: boolean) => Promise<void>;
  onDeleteChecklistItem: (checklistId: string, itemId: string) => Promise<void>;
  onDeleteChecklist: (checklistId: string) => void;
}

export function IdeaDetails({
  selectedIdea,
  checklists,
  isLoadingChecklists,
  onCreateChecklist,
  onAddChecklistItem,
  onToggleChecklistItem,
  onDeleteChecklistItem,
  onDeleteChecklist
}: IdeaDetailsProps) {
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [isAddingItem, setIsAddingItem] = useState<Record<string, boolean>>({});

  // Handler for adding a checklist item
  const handleAddItem = async (checklistId: string) => {
    const text = newItemText[checklistId];
    if (!text?.trim()) return;

    setIsAddingItem(prev => ({ ...prev, [checklistId]: true }));
    try {
      await onAddChecklistItem(checklistId, text);
      setNewItemText(prev => ({ ...prev, [checklistId]: '' }));
    } finally {
      setIsAddingItem(prev => ({ ...prev, [checklistId]: false }));
    }
  };

  if (!selectedIdea) {
    return (
      <Card className="w-full h-full flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <h3 className="text-lg font-medium">No Idea Selected</h3>
          <p className="text-muted-foreground">
            Select an idea from the list to view and manage checklists.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle>
            {selectedIdea.title || 'Idea Details'}
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
                onClick={onCreateChecklist}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="text-xs">Add</span>
              </Button>
            </div>
            
            {isLoadingChecklists ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Loading checklists...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {checklists.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No checklists found for this idea</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="mt-2" 
                      onClick={onCreateChecklist}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Checklist
                    </Button>
                  </div>
                ) : (
                  checklists.map((checklist) => (
                    <div key={checklist.id} className="border rounded-lg overflow-hidden">
                      <div className="p-3 bg-muted/20 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <CheckSquare className="h-4 w-4 text-primary" />
                          <div>
                            <h3 className="font-medium text-sm">{checklist.title}</h3>
                            <div className="text-xs text-muted-foreground">
                              {checklist.progress}% complete
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => onDeleteChecklist(checklist.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      
                      <div className="p-3 space-y-3">
                        <div className="w-full bg-muted/20 rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{ width: `${checklist.progress}%` }}
                          ></div>
                        </div>
                        
                        <ul className="space-y-2">
                          {checklist.checklist_items.map((item) => (
                            <li key={item.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`item-${item.id}`}
                                  checked={item.completed}
                                  onCheckedChange={() => 
                                    onToggleChecklistItem(checklist.id, item.id, item.completed)
                                  }
                                />
                                <Label 
                                  htmlFor={`item-${item.id}`}
                                  className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                                >
                                  {item.text}
                                </Label>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => onDeleteChecklistItem(checklist.id, item.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                        
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Add new item..."
                            value={newItemText[checklist.id] || ''}
                            onChange={(e) => setNewItemText(prev => ({ 
                              ...prev, 
                              [checklist.id]: e.target.value 
                            }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newItemText[checklist.id]?.trim()) {
                                e.preventDefault();
                                handleAddItem(checklist.id);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddItem(checklist.id)}
                            disabled={isAddingItem[checklist.id] || !newItemText[checklist.id]?.trim()}
                          >
                            {isAddingItem[checklist.id] ? 'Adding...' : 'Add'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="assignees" className="space-y-4 mt-2">
            <div className="flex justify-between items-center">
              <CardDescription>People working on this idea</CardDescription>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">Creator</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2">
                  <Link href={`/users/${selectedIdea.creator_id}`}>
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarFallback>
                        {selectedIdea.users?.display_name?.charAt(0) || 
                        selectedIdea.creator_id?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link href={`/users/${selectedIdea.creator_id}`} className="hover:underline">
                      <p className="text-sm font-medium">{selectedIdea.users?.display_name || 'User'}</p>
                    </Link>
                    <p className="text-xs text-muted-foreground">Creator</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">Assignees</h3>
              {!selectedIdea?.assignments || selectedIdea.assignments.length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">
                  No one is currently assigned to this idea.
                </div>
              ) : (
                selectedIdea.assignments.map(assignment => (
                  <div key={assignment.id} className="flex items-center justify-between py-2 border-t first:border-t-0">
                    <div className="flex items-center space-x-2">
                      <Link href={`/users/${assignment.user_id}`}>
                        <Avatar className="h-6 w-6 cursor-pointer">
                          <AvatarFallback className="text-xs">
                            {(assignment.assignee?.display_name || assignment.user_id).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div>
                        <Link href={`/users/${assignment.user_id}`} className="hover:underline">
                          <p className="text-sm font-medium">
                            {assignment.assignee?.display_name || assignment.user_id}
                          </p>
                        </Link>
                        <div className="flex items-center">
                          <Badge 
                            variant="outline" 
                            className={`mr-1 text-[10px] px-1 py-0 ${
                              assignment.status === 'completed' 
                                ? 'bg-green-100 text-green-800 border-green-200' 
                                : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}
                          >
                            {assignment.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {new Date(assignment.assigned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
