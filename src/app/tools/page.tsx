// app/tools/page.tsx

"use client"

import { MainLayout } from "@/components/main-layout";
import { ToolCard } from "@/components/tool-card";
import { Badge } from "@/components/ui/badge";
import { toolIcons } from "@/data/tool-icons";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { toast } from "@/components/ui/use-toast";
import { 
  ThumbsUp, 
  MessageSquare, 
  CheckSquare, 
  Loader2, 
  Users,
  Trash2,
  Star,
  GitFork,
  Eye,
  ArrowLeft,
  CalendarClock,
  Tag,
  AlertCircle,
  Dot,
  History,
  FileCode,
  PlusCircle,
  Plus
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Types to match our API responses
interface Tool {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  usage_count: number;
  categories: string[];
  power_users: {
    id: string;
    display_name: string;
    avatar_url: string;
  }[];
  icon?: React.ReactNode;
}

interface SuggestedTools {
  tools: Tool[];
  message?: string;
}

const ToolsPage = () => {
  // State for tools data
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [queryText, setQueryText] = useState("");
  const [suggestedTools, setSuggestedTools] = useState<SuggestedTools | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  
  // New tool modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingTool, setIsCreatingTool] = useState(false);
  const [newTool, setNewTool] = useState({
    name: "",
    description: "",
    icon_name: "cube", // Default icon
    categories: [] as string[],
    isPowerUser: true // Default to adding the current user as a power user
  });
  const [availableCategories, setAvailableCategories] = useState([
    "Design",
    "Development",
    "Productivity",
    "Collaboration",
    "Communication",
    "AI",
    "Marketing",
    "Analytics",
    "Finance"
  ]);
  const [newCategory, setNewCategory] = useState("");
  const { user } = useUser();

  // Popular categories for filtering
  const categories = [
    "All",
    "Design",
    "Development",
    "Productivity",
    "Collaboration",
    "Communication",
  ];

  // Fetch tools from the API
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        
        // Use the category filter if not "All"
        const url = activeCategory !== "All"
          ? `/api/tools?category=${encodeURIComponent(activeCategory)}`
          : '/api/tools';
          
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tools');
        }
        
        const data = await response.json();
        
        // Map the tools data to include the React icon component
        const toolsWithIcons = data.map((tool: Tool) => ({
          ...tool,
          icon: toolIcons[tool.icon_name as keyof typeof toolIcons],
        }));
        
        setTools(toolsWithIcons);
      } catch (error) {
        console.error('Error fetching tools:', error);
        toast({
          title: "Error",
          description: "Failed to load tools. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTools();
  }, [activeCategory]);

  // Handle tool suggestions
  const handleGetSuggestions = async () => {
    if (!queryText.trim()) return;
    
    try {
      setSuggesting(true);
      
      const response = await fetch(`/api/tools/suggest?query=${encodeURIComponent(queryText)}`);
      
      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }
      
      const data = await response.json();
      
      // Map the suggested tools to include the React icon component
      const suggestedWithIcons = {
        ...data,
        tools: data.tools.map((tool: Tool) => ({
          ...tool,
          icon: toolIcons[tool.icon_name as keyof typeof toolIcons],
        }))
      };
      
      setSuggestedTools(suggestedWithIcons);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to get tool suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 px-4 py-6 md:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Tools Directory</h1>
            <p className="text-muted-foreground">
              Discover and share tools that enhance productivity
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Tool
            </button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center space-x-2">
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
              className="text-primary"
            >
              <path d="M8.5 8.5 3 15l8.5 9 8.5-9-5.5-6.5L8.5 2 3 6l5.5 2.5Z" />
              <path d="M11 13 8.5 8.5 6 13l2.5 3 2.5-3Z" />
              <path d="M11 13h5.5l2.5-3-2.5-3h-5.5" />
              <path d="M11 13v6.5" />
              <path d="M3 6v9" />
              <path d="M20 6v9" />
              <path d="M14.5 5 11 3" />
            </svg>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Describe your problem, and I'll suggest the right tools..."
                className="w-full rounded-md border-0 bg-transparent px-3 py-2 text-base shadow-none focus:outline-none focus:ring-0"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
              />
            </div>
            <button 
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1"
              onClick={handleGetSuggestions}
              disabled={suggesting || !queryText.trim()}
            >
              {suggesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suggesting...
                </>
              ) : (
                "Get Suggestions"
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {categories.map((category, i) => (
            <button
              key={i}
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                category === activeCategory
                  ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                  : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Main tools grid */}
            {!suggestedTools && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    id={tool.id}
                    name={tool.name}
                    description={tool.description}
                    tags={tool.categories}
                    usageCount={tool.usage_count}
                    powerUsers={tool.power_users?.map(user => user.display_name) || []}
                    icon={tool.icon}
                  />
                ))}
                
                {tools.length === 0 && (
                  <div className="md:col-span-2 lg:col-span-3 py-12 text-center">
                    <p className="text-muted-foreground">No tools found in this category</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Suggested tools result */}
            {suggestedTools && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Suggested Tools</h2>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSuggestedTools(null)}
                  >
                    Back to All Tools
                  </Button>
                </div>
                
                {suggestedTools.message && (
                  <p className="text-sm text-muted-foreground">{suggestedTools.message}</p>
                )}
                
                {suggestedTools.tools.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {suggestedTools.tools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        id={tool.id}
                        name={tool.name}
                        description={tool.description}
                        tags={tool.categories}
                        usageCount={tool.usage_count || 0}
                        powerUsers={tool.power_users?.map(user => user.display_name) || []}
                        icon={tool.icon}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border p-8 text-center">
                    <p className="text-muted-foreground">No matching tools found</p>
                  </div>
                )}
                
                <div className="rounded-lg border p-4 bg-muted/20">
                  <h3 className="font-medium mb-2">Based on your search</h3>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="rounded-md bg-background p-2 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-md bg-primary/10 p-1">
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
                            className="text-primary"
                          >
                            <path d="M15 3a3 3 0 0 1 3 3m-3-3a3 3 0 0 0-3 3m3-3v1M9 3a3 3 0 0 0-3 3m3-3a3 3 0 0 1 3 3m-3-3v1M3 9a3 3 0 0 1 3-3M3 9a3 3 0 0 0 3 3M3 9H2m19 0a3 3 0 0 0-3-3m3 3a3 3 0 0 1-3 3m3-3h1M9 21a3 3 0 0 1-3-3m3 3a3 3 0 0 0 3-3m-3 3v-1m6 1a3 3 0 0 0 3-3m-3 3a3 3 0 0 1-3-3m3 3v-1m-9-9a3 3 0 0 0-3 3m3-3a3 3 0 0 1 3 3m-3-3v1m12-1a3 3 0 0 1 3 3m-3-3a3 3 0 0 0-3 3m3-3v1" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Figma</div>
                          <div className="text-xs text-muted-foreground">Design & Prototyping</div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-md bg-background p-2 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-md bg-primary/10 p-1">
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
                            className="text-primary"
                          >
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <path d="M7 7h10" />
                            <path d="M7 12h10" />
                            <path d="M7 17h10" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Notion</div>
                          <div className="text-xs text-muted-foreground">Documentation</div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-md bg-background p-2 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-md bg-primary/10 p-1">
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
                            className="text-primary"
                          >
                            <path d="M18 7 4 17l8.5 9 8.5-9-5.5-6.5L18 7z" />
                            <path d="M11 13 8.5 8.5 6 13l2.5 3 2.5-3Z" />
                            <path d="M11 13h5.5l2.5-3-2.5-3h-5.5" />
                            <path d="M11 13v6.5" />
                            <path d="M3 6v9" />
                            <path d="M20 6v9" />
                            <path d="M14.5 5 11 3" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Slack</div>
                          <div className="text-xs text-muted-foreground">Communication</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This combination is popular among design teams who need to collaborate
                    across different platforms while maintaining thorough documentation.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Tool Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add a New Tool</DialogTitle>
            <DialogDescription>
              Share a useful tool with the community. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name*
              </Label>
              <Input
                id="name"
                value={newTool.name}
                onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                className="col-span-3"
                placeholder="Tool name"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description*
              </Label>
              <Textarea
                id="description"
                value={newTool.description}
                onChange={(e) => setNewTool({...newTool, description: e.target.value})}
                className="col-span-3"
                placeholder="What does this tool do?"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Icon
              </Label>
              <Select 
                value={newTool.icon_name} 
                onValueChange={(value) => setNewTool({...newTool, icon_name: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cube">Cube</SelectItem>
                  <SelectItem value="figma">Figma</SelectItem>
                  <SelectItem value="vscode">VS Code</SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="notion">Notion</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="trello">Trello</SelectItem>
                  <SelectItem value="photoshop">Photoshop</SelectItem>
                  <SelectItem value="illustrator">Illustrator</SelectItem>
                  <SelectItem value="sketch">Sketch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Categories
              </Label>
              <div className="col-span-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-${category}`} 
                        checked={newTool.categories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewTool({
                              ...newTool, 
                              categories: [...newTool.categories, category]
                            });
                          } else {
                            setNewTool({
                              ...newTool, 
                              categories: newTool.categories.filter(c => c !== category)
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add custom category..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (newCategory && !availableCategories.includes(newCategory)) {
                        setAvailableCategories([...availableCategories, newCategory]);
                        setNewTool({
                          ...newTool,
                          categories: [...newTool.categories, newCategory]
                        });
                        setNewCategory("");
                      }
                    }}
                    disabled={!newCategory.trim() || availableCategories.includes(newCategory)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label htmlFor="power-user" className="mr-2">
                  Power User
                </Label>
              </div>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox 
                  id="power-user"
                  checked={newTool.isPowerUser}
                  onCheckedChange={(checked) => 
                    setNewTool({...newTool, isPowerUser: checked as boolean})
                  }
                  disabled={!user}
                />
                <label
                  htmlFor="power-user"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {user ? `Add me (${user.fullName || user.username}) as a power user` : "Sign in to add yourself as a power user"}
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreatingTool || !newTool.name || !newTool.description}
              onClick={handleCreateTool}
            >
              {isCreatingTool ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Tool"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
  
  // Function to handle creating a new tool
  async function handleCreateTool() {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add a tool.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newTool.name || !newTool.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in the required fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsCreatingTool(true);
      
      const response = await fetch('/api/tools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTool.name,
          description: newTool.description,
          icon_name: newTool.icon_name,
          categories: newTool.categories,
          addAsPowerUser: newTool.isPowerUser
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create tool');
      }
      
      const data = await response.json();
      
      // Add the newly created tool to the list
      const toolWithIcon = {
        ...data,
        icon: toolIcons[data.icon_name as keyof typeof toolIcons],
      };
      
      setTools([toolWithIcon, ...tools]);
      
      // Reset form and close modal
      setNewTool({
        name: "",
        description: "",
        icon_name: "cube",
        categories: [],
        isPowerUser: true
      });
      
      setIsModalOpen(false);
      
      toast({
        title: "Tool Added",
        description: "Your tool has been added to the directory.",
      });
    } catch (error) {
      console.error('Error creating tool:', error);
      toast({
        title: "Error",
        description: "Failed to create tool. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingTool(false);
    }
  }
};

export default ToolsPage;
