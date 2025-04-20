// app/tools/[id]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ThumbsUp,
  MessageSquare,
  Loader2,
  Users,
  ArrowLeft,
  Link as LinkIcon,
  Star,
  Award,
  Lightbulb,
  BookOpen,
  Settings,
  Code,
  FileCode,
  ExternalLink,
  PlusCircle,
  Wand2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toolIcons } from "@/data/tool-icons";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PowerUser {
  id: string; // This is the power_user record ID
  user_id: string; // This is the actual user ID
  created_at: string;
  user?: { // User profile data
    id: string;
    display_name: string;
    avatar_url: string;
  }
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  usage_count: number;
  categories: string[];
  power_users: PowerUser[];
  website_url?: string;
  documentation_url?: string;
  alternatives?: string[];
  pros?: string[];
  cons?: string[];
  best_for?: string[];
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
}

export default function ToolDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [tool, setTool] = useState<Tool | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPowerUser, setIsPowerUser] = useState(false);
  const [isTogglingPowerUser, setIsTogglingPowerUser] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [expertiseLevel, setExpertiseLevel] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch tool details when the component mounts
  useEffect(() => {
    async function fetchToolDetails() {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/tools/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tool details');
        }
        
        const toolData = await response.json();
        
        // Add the icon component
        const toolWithIcon = {
          ...toolData,
          icon: toolIcons[toolData.icon_name as keyof typeof toolIcons],
        };
        
        setTool(toolWithIcon);
        
        // Check if the current user is a power user
        if (isUserLoaded && user) {
          const isPower = toolData.power_users?.some((pu: PowerUser) => pu.user_id === user.id);
          setIsPowerUser(isPower || false);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching tool details:", err);
        setError("Could not load tool details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchToolDetails();
  }, [id, isUserLoaded, user]);

  // Handle becoming a power user
  const handleBecomePowerUser = async () => {
    if (!isUserLoaded || !user || !id) return;

    setConfirmDialogOpen(true);
  };

  // Handle removing as power user
  const handleRemovePowerUser = async () => {
    if (!isUserLoaded || !user || !id) return;
    
    try {
      setIsTogglingPowerUser(true);
      
      const response = await fetch(`/api/tools/${id}/power-users`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove power user status');
      }
      
      // Update the UI
      setIsPowerUser(false);
      
      // Update the tool object
      if (tool) {
        setTool({
          ...tool,
          power_users: tool.power_users.filter(pu => pu.id !== user.id)
        });
      }
      
      toast.success("You are no longer a power user for this tool");
      
    } catch (error) {
      console.error('Error removing power user status:', error);
      toast.error("Failed to remove power user status");
    } finally {
      setIsTogglingPowerUser(false);
    }
  };

  // Handle confirming power user status
  const handleConfirmPowerUser = async () => {
    if (!isUserLoaded || !user || !id) return;
    
    try {
      setIsTogglingPowerUser(true);
      
      // Log for debugging
      console.log('Sending power user request for tool:', id, 'and user:', user.id);
      
      const response = await fetch(`/api/tools/${id}/power-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Simplify the request body - remove expertise_level as it's not in the schema
        body: JSON.stringify({})
      });
      
      // Parse the JSON response instead of getting text
      const responseData = await response.json();
      console.log('Power user API response:', responseData);
      
      if (!response.ok) {
        // Include any details from the API in the error message
        const errorMessage = responseData.error || 'Unknown error';
        const details = responseData.details ? JSON.stringify(responseData.details) : '';
        throw new Error(`Failed to add as power user: ${errorMessage} ${details}`);
      }
      
      // Get updated tool data
      const toolResponse = await fetch(`/api/tools/${id}`);
      
      if (!toolResponse.ok) {
        console.error('Failed to fetch updated tool data');
        // Continue anyway - we'll just mark the user as a power user without refreshing tool data
      } else {
        const updatedTool = await toolResponse.json();
      
        // Add the icon component
        const toolWithIcon = {
          ...updatedTool,
          icon: toolIcons[updatedTool.icon_name as keyof typeof toolIcons],
        };
        
        setTool(toolWithIcon);
      }
      setIsPowerUser(true);
      setConfirmDialogOpen(false);
      
      toast.success("You are now a power user for this tool!");
      
    } catch (error: any) {
      console.error('Error adding power user status:', error);
      console.log('Full error details:', error);
      toast.error(`Failed to add power user status: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsTogglingPowerUser(false);
    }
  };

  // Function to get initials from name
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen px-4 py-6 md:px-6 lg:px-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error || !tool) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-6 md:px-6 lg:px-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold">Tool Not Found</h2>
            <p className="text-muted-foreground">{error || "The requested tool could not be found."}</p>
            <Button variant="outline" onClick={() => router.push('/tools')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tools
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full min-w-[320px] px-4 py-4 sm:px-6 sm:py-6 mx-auto max-w-4xl overflow-x-hidden">
        {/* Tool Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 p-2 flex items-center justify-center text-primary">
            {/* ts-ignore */}
              {toolIcons[tool.icon_name]}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{tool.name}</h1>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{tool.power_users?.length || 0} power users</span>
                <span className="text-xs">•</span>
                <ThumbsUp className="h-4 w-4" />
                <span>{tool.usage_count} uses</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push('/tools')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            {isUserLoaded && user && (
              isPowerUser ? (
                <Button 
                  variant="outline" 
                  onClick={handleRemovePowerUser}
                  disabled={isTogglingPowerUser}
                >
                  {isTogglingPowerUser ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Remove Power User Status
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={handleBecomePowerUser}
                  disabled={isTogglingPowerUser}
                >
                  {isTogglingPowerUser ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Award className="mr-2 h-4 w-4" />
                      I'm a Power User
                    </>
                  )}
                </Button>
              )
            )}
          </div>
        </div>
        
        {/* Category Tags */}
        <div className="flex flex-wrap gap-2">
          {tool.categories?.map((category, i) => (
            <Badge key={i} variant="secondary">{category}</Badge>
          ))}
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="power-users">Power Users</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About this tool</CardTitle>
                <CardDescription>
                  Added {formatDistanceToNow(new Date(tool.created_at), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <article className="prose dark:prose-invert max-w-full break-words hyphens-auto overflow-wrap-anywhere [&>*]:max-w-full [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_pre]:text-sm [&_pre]:whitespace-pre-wrap [&_table]:max-w-full [&_table]:overflow-x-auto [&_img]:max-w-full [&_iframe]:max-w-full [&_a]:break-all">
                  <p className="text-base">{tool.description}</p>
                </article>
              </CardContent>
            </Card>
            
            <div className="grid gap-4 md:grid-cols-3">
              {/* Pros */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                    Pros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tool.pros && tool.pros.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {tool.pros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No pros listed yet</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Cons */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <XCircle className="mr-2 h-5 w-5 text-red-500" />
                    Cons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tool.cons && tool.cons.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {tool.cons.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No cons listed yet</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Best For */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                    Best For
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tool.best_for && tool.best_for.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {tool.best_for.map((use, i) => (
                        <li key={i}>{use}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No use cases listed yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Alternatives */}
            <Card>
              <CardHeader>
                <CardTitle>Alternative Tools</CardTitle>
                <CardDescription>
                  Other tools with similar functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tool.alternatives && tool.alternatives.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tool.alternatives.map((alt, i) => (
                      <Badge key={i} variant="outline">{alt}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No alternatives listed</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="power-users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Power Users</CardTitle>
                <CardDescription>
                  These users have expertise with {tool.name} and may be able to help you
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tool.power_users && tool.power_users.length > 0 ? (
                  <ul className="divide-y divide-border rounded-md border">
                    {tool.power_users.map((powerUser) => (
                      <li key={powerUser.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={powerUser.user?.avatar_url} alt={powerUser.user?.display_name || 'Power User'} />
                            <AvatarFallback>{powerUser.user?.display_name ? getInitials(powerUser.user.display_name) : '??'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium leading-none mb-1">{powerUser.user?.display_name || 'User'}</div>
                            <div className="text-sm text-muted-foreground">
                              {"Expert user"}
                              {powerUser.created_at && ` • Since ${formatDistanceToNow(new Date(powerUser.created_at), { addSuffix: true })}`}
                            </div>
                          </div>
                        </div>
                        
                        <Badge variant="secondary" className="font-normal">
                          <Users className="mr-1 h-3 w-3" />
                          Power User
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <Award className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                    <h3 className="mt-4 text-lg font-medium">No power users yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Be the first to become a power user for this tool!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>What makes a power user?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p>
                    Power users have extensive knowledge and experience with this tool. They can answer questions, 
                    provide best practices, and help others get the most out of it.
                  </p>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
                      <BookOpen className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-medium">Expert Knowledge</h3>
                      <p className="text-sm text-muted-foreground">Deep understanding of features and capabilities</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
                      <Code className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-medium">Practical Experience</h3>
                      <p className="text-sm text-muted-foreground">Real-world usage and implementation knowledge</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center p-4 rounded-lg border bg-card">
                      <Wand2 className="h-8 w-8 text-primary mb-2" />
                      <h3 className="font-medium">Best Practices</h3>
                      <p className="text-sm text-muted-foreground">Understanding of optimal ways to use the tool</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Useful Resources</CardTitle>
                <CardDescription>
                  Documentation, tutorials, and guides for {tool.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(tool.website_url || tool.documentation_url) ? (
                  <div className="space-y-2">
                    {tool.website_url && (
                      <div className="flex items-center justify-between p-3 rounded-md border">
                        <div className="flex items-center">
                          <LinkIcon className="h-5 w-5 mr-3 text-primary" />
                          <span>Official Website</span>
                        </div>
                        <a 
                          href={tool.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-primary hover:underline"
                        >
                          Visit <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    )}
                    
                    {tool.documentation_url && (
                      <div className="flex items-center justify-between p-3 rounded-md border">
                        <div className="flex items-center">
                          <FileCode className="h-5 w-5 mr-3 text-primary" />
                          <span>Documentation</span>
                        </div>
                        <a 
                          href={tool.documentation_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-primary hover:underline"
                        >
                          View <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No official resources available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Power User Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Become a Power User</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to mark yourself as a power user for {tool?.name}. 
              This indicates you have expertise with this tool and are willing to help others.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium mb-1 block">Your expertise level:</label>
            <select 
              className="w-full px-3 py-2 border rounded-md bg-background" 
              value={expertiseLevel} 
              onChange={(e) => setExpertiseLevel(e.target.value)}
            >
              <option value="">Select your expertise level</option>
              <option value="Daily user">Daily user</option>
              <option value="Advanced user">Advanced user</option>
              <option value="Expert">Expert</option>
              <option value="Professional">Professional</option>
              <option value="Certified expert">Certified expert</option>
            </select>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPowerUser} disabled={!expertiseLevel}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
