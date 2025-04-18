"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Idea, User } from "@/lib/database";
import { MainLayout } from "@/components/main-layout";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function UserProfilePage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setLoading(true);
        const response = await fetch(`/api/users?userId=${id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
        
        const data = await response.json();
        setUser(data.user);
        setIdeas(data.user?.ideas || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Could not load user profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchUserProfile();
    }
  }, [id]);

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
        <div className="container p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !user) {
    return (
      <MainLayout>
        <div className="container p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-xl text-red-500">{error || "User not found"}</p>
            <Link href="/users" className="mt-4 text-primary hover:underline">
              Back to users directory
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container p-6">
        {/* User Profile Header */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar_url} alt={user.display_name} />
            <AvatarFallback>{getInitials(user.display_name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{user.display_name}</h1>
              <Badge variant={user.is_online ? "default" : "outline"}>
                {user.is_online ? "Online" : "Offline"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">{user.email}</p>
            {user.bio && <p className="mt-2">{user.bio}</p>}
            <p className="text-sm text-muted-foreground mt-2">
              {user.last_active && (
                <>Last active {formatDistanceToNow(new Date(user.last_active), { addSuffix: true })}</>
              )}
            </p>
          </div>
        </div>

        {/* Published Ideas */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Published Ideas</h2>
          
          {ideas.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              This user hasn't published any ideas yet.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {ideas.map((idea: any) => (
                <Card key={idea.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Link href={`/ideas/${idea.id}`}>
                      <CardTitle className="text-lg hover:text-primary transition-colors">
                        {idea.title}
                      </CardTitle>
                    </Link>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {idea.tags && idea.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {idea.description}
                    </p>
                    <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {idea.status}
                      </Badge>
                      <span>{idea.upvotes} upvotes</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
