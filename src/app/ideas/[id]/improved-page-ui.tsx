  const isUserAssigned = assignments.some(a => a.user_id === user?.id);

  return (
    <MainLayout>
      <div className="github-style">
        {/* GitHub-style header with repo-like navigation */}
        <div className="border-b bg-background">
          <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8">
            <div className="mb-4">
              <Link href="/ideas" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to ideas
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-semibold flex items-center">
                  <Tag className="mr-2 h-5 w-5 text-muted-foreground" />
                  {idea.title}
                  <div className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {idea.status || "Open"}
                  </div>
                </h1>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Voting buttons */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`text-xs flex items-center gap-1 ${userVote === 1 ? 'vote-button upvoted' : 'vote-button'}`}
                  onClick={() => handleVote(1)} 
                  disabled={isVoting || !isUserLoaded || !user}
                >
                  <ThumbsUp className={`h-4 w-4 ${userVote === 1 ? 'fill-current' : ''}`} />
                  <span>{idea.upvotes || 0}</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`text-xs flex items-center gap-1 ${userVote === -1 ? 'vote-button downvoted' : 'vote-button'}`}
                  onClick={() => handleVote(-1)} 
                  disabled={isVoting || !isUserLoaded || !user}
                >
                  <ThumbsDown className={`h-4 w-4 ${userVote === -1 ? 'fill-current' : ''}`} />
                </Button>
                
                {/* Assignment button for mobile */}
                <div className="sm:hidden">
                  {isUserLoaded && user ? (
                    isUserAssigned ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleUnpickIdea}
                        disabled={isUnassigning}
                        className="text-xs"
                      >
                        {isUnassigning ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          "Stop working on this"
                        )}
                      </Button>
                    ) : (
                      <Button 
                        variant="default"
                        size="sm"
                        onClick={handlePickIdea}
                        disabled={isAssigning}
                        className="text-xs"
                      >
                        {isAssigning ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          "Work on this"
                        )}
                      </Button>
                    )
                  ) : null}
                </div>
              </div>
            </div>
            
            <div className="mt-4 border-b pb-1">
              <nav className="flex overflow-x-auto">
                <div className="flex -mb-px">
                  <button 
                    onClick={() => setActiveTab("discussion")}
                    className={`flex items-center px-4 py-2 border-b-2 text-sm ${
                      activeTab === "discussion" 
                        ? "border-primary font-medium text-foreground active-tab" 
                        : "border-transparent hover:border-gray-300 text-muted-foreground hover:text-foreground transition-colors inactive-tab"
                    }`}
                  >
                    <MessageSquare className="mr-1 h-4 w-4" />
                    Discussion <span className="ml-1 bg-muted rounded-full px-2">{commentCount}</span>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab("implementation")}
                    className={`flex items-center px-4 py-2 border-b-2 text-sm ${
                      activeTab === "implementation" 
                        ? "border-primary font-medium text-foreground active-tab" 
                        : "border-transparent hover:border-gray-300 text-muted-foreground hover:text-foreground transition-colors inactive-tab"
                    }`}
                  >
                    <CheckSquare className="mr-1 h-4 w-4" />
                    Implementation
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab("history")}
                    className={`flex items-center px-4 py-2 border-b-2 text-sm ${
                      activeTab === "history" 
                        ? "border-primary font-medium text-foreground active-tab" 
                        : "border-transparent hover:border-gray-300 text-muted-foreground hover:text-foreground transition-colors inactive-tab"
                    }`}
                  >
                    <History className="mr-1 h-4 w-4" />
                    History
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            {/* Idea description section */}
            <div className="border bg-card rounded-md shadow-sm overflow-hidden">
              <div className="flex items-center px-4 py-2 bg-muted/30 border-b">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={idea.user?.avatar_url} alt={idea.user?.display_name} />
                  <AvatarFallback>{getInitials(idea.user?.display_name || "")}</AvatarFallback>
                </Avatar>
                <Link href={`/users/${idea.creator_id}`} className="text-sm font-medium hover:underline mr-1">
                  {idea.user?.display_name}
                </Link>
                <span className="text-sm text-muted-foreground">opened this idea {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}</span>
                <span className="text-sm text-muted-foreground mx-1">•</span>
                <span className="text-sm text-muted-foreground">{commentCount} comments</span>
              </div>
              
              <div className="p-4">
                <div className="prose prose-sm max-w-none dark:prose-invert mb-4">
                  <p className="whitespace-pre-wrap">{idea.description}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {idea.tags && idea.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="mr-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Assignment section */}
            <div className="border rounded-md p-4 bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">People working on this</h3>
                </div>
                
                {/* Assignment controls - Desktop */}
                <div className="hidden sm:block">
                  {isUserLoaded && user ? (
                    isUserAssigned ? (
                      <Button 
                        variant="outline" 
                        onClick={handleUnpickIdea}
                        disabled={isUnassigning}
                      >
                        {isUnassigning ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          "Stop working on this"
                        )}
                      </Button>
                    ) : (
                      <Button 
                        variant="default"
                        onClick={handlePickIdea}
                        disabled={isAssigning}
                      >
                        {isAssigning ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          "I want to work on this"
                        )}
                      </Button>
                    )
                  ) : isUserLoaded ? (
                    <Button variant="outline" asChild>
                      <Link href="/sign-in">Sign in to collaborate</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
              
              {/* Assignees list */}
              {assignments.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {assignments.map(assignment => (
                    <div key={assignment.id} className="flex items-center gap-2 rounded-md border p-3">
                      <Avatar>
                        <AvatarImage src={assignment.user?.avatar_url} alt={assignment.user?.display_name} />
                        <AvatarFallback>{getInitials(assignment.user?.display_name || "")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <Link href={`/users/${assignment.user_id}`} className="font-medium hover:underline">
                          {assignment.user?.display_name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          Joined {formatDistanceToNow(new Date(assignment.assigned_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">Nobody is working on this idea yet. Be the first to pick it up!</p>
                </div>
              )}
            </div>
            
            {/* Content based on active tab */}
            <div className="mt-4">
              {activeTab === "discussion" && (
                <div className="space-y-6">
                  {/* Comment input */}
                  {isUserLoaded && user ? (
                    <div className="mb-6">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
                          <AvatarFallback>{getInitials(user.fullName || "")}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 rounded-lg border p-0.5">
                          <Textarea
                            placeholder="Leave a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-24 border-0 focus-visible:ring-0 focus-visible:ring-transparent"
                          />
                          <div className="flex justify-end p-2 border-t">
                            <Button
                              onClick={handleSubmitComment}
                              disabled={!newComment.trim() || isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Posting...
                                </>
                              ) : (
                                "Post Comment"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : isUserLoaded ? (
                    <div className="bg-muted rounded-lg p-4 mb-6 text-center">
                      <p>
                        Please{" "}
                        <Link href="/sign-in" className="text-primary hover:underline">
                          sign in
                        </Link>{" "}
                        to join the discussion.
                      </p>
                    </div>
                  ) : null}

                  {/* Comments thread */}
                  {comments.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg">
                      <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border rounded-lg">
                          <div className="border-b bg-muted/50 p-3 flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={comment.user?.avatar_url} alt={comment.user?.display_name} />
                              <AvatarFallback>{getInitials(comment.user?.display_name || "")}</AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-1 text-sm">
                              <Link href={`/users/${comment.user_id}`} className="font-medium hover:underline">
                                {comment.user?.display_name}
                              </Link>
                              <span className="text-muted-foreground">commented {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "implementation" && (
                <div className="space-y-6">
                  {isUserLoaded && user ? (
                    isUserAssigned ? (
                      <>
                        {/* Create New Checklist */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Create New Checklist</CardTitle>
                            <CardDescription>
                              Add a checklist to track implementation tasks for this idea
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="checklist-title" className="text-right">
                                  Title
                                </Label>
                                <Input
                                  id="checklist-title"
                                  value={newChecklistTitle}
                                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                                  className="col-span-3"
                                  placeholder="What needs to be done?"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="checklist-type" className="text-right">
                                  Type
                                </Label>
                                <div className="col-span-3 flex items-center space-x-2">
                                  <select
                                    id="checklist-type"
                                    value={newChecklistType}
                                    onChange={(e) => setNewChecklistType(e.target.value as 'personal' | 'shared')}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <option value="personal">Personal (Only I can see)</option>
                                    <option value="shared">Shared (All collaborators can see)</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex justify-end">
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
                                    "Create Checklist"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Shared Checklists - Display if they exist */}
                        {checklists.shared && checklists.shared.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center">
                                <Users className="mr-2 h-4 w-4" />
                                Shared Checklists
                              </CardTitle>
                              <CardDescription>
                                Checklists visible to all collaborators working on this idea
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {isLoadingChecklists ? (
                                <div className="flex justify-center py-8">
                                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  {checklists.shared.map((checklist) => (
                                    <div key={checklist.id} className="rounded-md border p-4 space-y-4">
                                      {/* Checklist content would go here */}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Personal Checklists - Display if they exist */}
                        {checklists.personal && checklists.personal.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center">
                                <CheckSquare className="mr-2 h-4 w-4" />
                                My Personal Checklists
                              </CardTitle>
                              <CardDescription>
                                Private checklists only visible to you
                              </CardDescription>
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
                                      {/* Checklist content would go here */}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* Empty state if no checklists */}
                        {(!checklists.personal || checklists.personal.length === 0) && 
                         (!checklists.shared || checklists.shared.length === 0) && 
                         !isLoadingChecklists && (
                          <div className="text-center py-8 border rounded-lg">
                            <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="text-muted-foreground">No checklists yet.</p>
                            <p className="text-muted-foreground text-sm">
                              Use the form above to create a checklist for tracking implementation tasks.
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 border rounded-lg">
                        <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-muted-foreground">You need to be working on this idea to create checklists.</p>
                        <Button
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
                            "I want to work on this"
                          )}
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 border rounded-lg">
                      <CheckSquare className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-muted-foreground">
                        Please{" "}
                        <Link href="/sign-in" className="text-primary hover:underline">
                          sign in
                        </Link>{" "}
                        to manage checklists.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "history" && (
                <div className="space-y-6">
                  {isLoadingHistory ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : history.length > 0 ? (
                    <div className="border rounded-lg">
                      <div className="bg-muted/30 p-3 border-b">
                        <h3 className="font-semibold">History</h3>
                      </div>
                      <div className="divide-y">
                        {history.map((item) => (
                          <div key={item.id} className="p-4 flex items-start gap-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={item.user?.avatar_url} alt={item.user?.display_name} />
                              <AvatarFallback>{getInitials(item.user?.display_name || "")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1 text-sm">
                                <Link href={`/users/${item.user?.id}`} className="font-medium hover:underline">
                                  {item.user?.display_name}
                                </Link>
                                <span className="text-muted-foreground">
                                  {item.action === 'created' ? 'created this idea' : 
                                   item.action === 'assigned' ? 'started working on this idea' : 
                                   `updated ${item.field || 'this idea'}`}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-lg">
                      <History className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                      <p className="text-muted-foreground">No history available for this idea.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this checklist?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All items in this checklist will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setChecklistToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteChecklist}
              disabled={isDeletingChecklist}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingChecklist ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
