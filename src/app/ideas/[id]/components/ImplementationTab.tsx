import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { CheckSquare, Loader2, PlusCircle, Trash2, Users } from "lucide-react";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
  user?: {
    display_name: string;
    avatar_url: string;
  };
}

interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  created_at: string;
  user: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
}

interface ImplementationTabProps {
  isUserLoaded: boolean;
  user: any;
  isUserAssigned: boolean;
  handlePickIdea: () => void;
  isAssigning: boolean;
  isLoadingChecklists: boolean;
  checklists: {
    personal: Checklist[];
    shared: Checklist[];
  };
  newChecklistTitle: string;
  setNewChecklistTitle: (value: string) => void;
  newChecklistType: 'personal' | 'shared';
  setNewChecklistType: (value: 'personal' | 'shared') => void;
  handleCreateChecklist: () => void;
  isCreatingChecklist: boolean;
  newItemText: Record<string, string>;
  setNewItemText: (value: Record<string, string>) => void;
  handleAddChecklistItem: (checklistId: string, type: 'personal' | 'shared') => void;
  isAddingItem: Record<string, boolean>;
  handleToggleChecklistItem: (checklistId: string, itemId: string, completed: boolean, type: 'personal' | 'shared') => void;
  setChecklistToDeleteId: (id: string | null) => void;
  setIsConfirmDeleteOpen: (open: boolean) => void;
  getInitials: (name: string) => string;
}

export function ImplementationTab({
  isUserLoaded,
  user,
  isUserAssigned,
  handlePickIdea,
  isAssigning,
  isLoadingChecklists,
  checklists,
  newChecklistTitle,
  setNewChecklistTitle,
  newChecklistType,
  setNewChecklistType,
  handleCreateChecklist,
  isCreatingChecklist,
  newItemText,
  setNewItemText,
  handleAddChecklistItem,
  isAddingItem,
  handleToggleChecklistItem,
  setChecklistToDeleteId,
  setIsConfirmDeleteOpen,
  getInitials
}: ImplementationTabProps) {
  const handleDeleteClick = (checklistId: string) => {
    setChecklistToDeleteId(checklistId);
    setIsConfirmDeleteOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Implementation Checklists</CardTitle>
        <CardDescription>
          Track your progress implementing this idea using checklists
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {isUserLoaded && user ? (
            isUserAssigned ? (
              <>
                {/* Create New Checklist */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Create New Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Input
                          placeholder="Checklist title..."
                          value={newChecklistTitle}
                          onChange={(e) => setNewChecklistTitle(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={newChecklistType === 'personal' ? 'default' : 'outline'}
                          onClick={() => setNewChecklistType('personal')}
                          className="justify-start"
                        >
                          <CheckSquare className="mr-2 h-4 w-4" />
                          Personal
                        </Button>
                        <Button
                          variant={newChecklistType === 'shared' ? 'default' : 'outline'}
                          onClick={() => setNewChecklistType('shared')}
                          className="justify-start"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Shared
                        </Button>
                      </div>
                      <Button
                        onClick={handleCreateChecklist}
                        disabled={isCreatingChecklist || !newChecklistTitle.trim()}
                      >
                        {isCreatingChecklist ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Checklist
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Shared Checklists */}
                {checklists?.shared?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Shared Checklists
                      </CardTitle>
                      <CardDescription>Visible to everyone working on this idea</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingChecklists ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {checklists?.shared?.map((checklist) => (
                            <div key={checklist.id} className="rounded-md border p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{checklist.title}</h3>
                                  <Badge variant="outline" className="ml-2">
                                    Shared
                                  </Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(checklist.id)}
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="text-xs text-muted-foreground flex items-center">
                                <Avatar className="h-4 w-4 mr-1">
                                  <AvatarImage src={checklist.user.avatar_url} alt={checklist.user.display_name} />
                                  <AvatarFallback>{getInitials(checklist.user.display_name)}</AvatarFallback>
                                </Avatar>
                                Created by {checklist.user.display_name} {formatDistanceToNow(new Date(checklist.created_at), { addSuffix: true })}
                              </div>
                              
                              <div className="space-y-2">
                                {checklist.items && checklist.items.length > 0 ? (
                                  checklist.items.map((item) => {
                                    const isCompleted = item.completed;
                                    return (
                                      <div className="flex items-start space-x-2" key={item.id}>
                                        <Checkbox
                                          id={`item-${item.id}`}
                                          checked={isCompleted}
                                          onCheckedChange={(checked) => {
                                            handleToggleChecklistItem(
                                              checklist.id,
                                              item.id,
                                              checked as boolean,
                                              'shared'
                                            );
                                          }}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                          <label
                                            htmlFor={`item-${item.id}`}
                                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
                                          >
                                            {item.text}
                                          </label>
                                          {isCompleted && item.user && (
                                            <p className="text-xs text-muted-foreground flex items-center">
                                              <Avatar className="h-3 w-3 mr-1">
                                                <AvatarImage src={item.user.avatar_url} alt={item.user.display_name} />
                                                <AvatarFallback>{getInitials(item.user.display_name)}</AvatarFallback>
                                              </Avatar>
                                              Completed by {item.user.display_name} {item.completed_at && formatDistanceToNow(new Date(item.completed_at), { addSuffix: true })}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="text-sm text-muted-foreground py-2">No items in this checklist yet.</div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 pt-2">
                                <Input
                                  placeholder="Add a new item..."
                                  value={newItemText[checklist.id] || ''}
                                  onChange={(e) => {
                                    const updatedText = { ...newItemText };
                                    updatedText[checklist.id] = e.target.value;
                                    setNewItemText(updatedText);
                                  }}
                                  className="text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleAddChecklistItem(checklist.id, 'shared')}
                                  disabled={isAddingItem[checklist.id] || !newItemText[checklist.id]?.trim()}
                                >
                                  {isAddingItem[checklist.id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <PlusCircle className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Personal Checklists */}
                {checklists.personal.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <CheckSquare className="mr-2 h-4 w-4" />
                        My Personal Checklists
                      </CardTitle>
                      <CardDescription>Only visible to you</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingChecklists ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {checklists.personal.map((checklist) => (
                            <div key={checklist.id} className="rounded-md border p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <h3 className="font-medium">{checklist.title}</h3>
                                  <Badge variant="outline" className="ml-2">Personal</Badge>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(checklist.id)}
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="text-xs text-muted-foreground">
                                Created {formatDistanceToNow(new Date(checklist.created_at), { addSuffix: true })}
                              </div>
                              
                              <div className="space-y-2">
                                {checklist?.items?.length > 0 ? (
                                  checklist.items.map((item) => (
                                    <div className="flex items-start space-x-2" key={item.id}>
                                    <Checkbox
                                      id={`item-${item.id}`}
                                      checked={item.completed}
                                      onCheckedChange={(checked) => {
                                        handleToggleChecklistItem(
                                          checklist.id,
                                          item.id,
                                          checked as boolean,
                                          'personal'
                                        );
                                      }}
                                    />
                                    <label
                                      htmlFor={`item-${item.id}`}
                                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                                    >
                                      {item.text}
                                    </label>
                                  </div>
                                  ))
                                ) : (
                                  <div className="text-sm text-muted-foreground py-2">No items in this checklist yet.</div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 pt-2">
                                <Input
                                  placeholder="Add a new item..."
                                  value={newItemText[checklist.id] || ''}
                                  onChange={(e) => {
                                    const updatedText = { ...newItemText };
                                    updatedText[checklist.id] = e.target.value;
                                    setNewItemText(updatedText);
                                  }}
                                  className="text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleAddChecklistItem(checklist.id, 'personal')}
                                  disabled={isAddingItem[checklist.id] || !newItemText[checklist.id]?.trim()}
                                >
                                  {isAddingItem[checklist.id] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <PlusCircle className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Empty state if no checklists */}
                {checklists.personal.length === 0 && checklists.shared.length === 0 && !isLoadingChecklists && (
                  <div className="text-center py-8 border rounded-lg">
                    <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">No checklists yet. Create one to track implementation!</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">You need to be assigned to this idea to create checklists.</p>
                <Button 
                  variant="outline"
                  className="mt-4"
                  onClick={handlePickIdea}
                  disabled={isAssigning}
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>Pick this idea</>
                  )}
                </Button>
              </div>
            )
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">
                Please{" "}
                <a href="/sign-in" className="text-primary hover:underline">
                  sign in
                </a>{" "}
                to create checklists and track implementation.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
