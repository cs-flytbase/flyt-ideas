"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { MainLayout } from "@/components/main-layout";

export default function NewHelpRequestPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");

  const addTag = () => {
    const trimmedTag = currentTag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/help-requests">
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
                className="h-4 w-4"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span className="ml-1">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Request Help</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Help Request</CardTitle>
            <CardDescription>
              Describe your issue clearly and our community will help you solve it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Brief summary of your issue" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your issue in detail. Include what you've tried so far and any error messages you're seeing."
                className="min-h-[150px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <RadioGroup defaultValue="medium">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="priority-low" />
                    <Label htmlFor="priority-low">Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="priority-medium" />
                    <Label htmlFor="priority-medium">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="priority-high" />
                    <Label htmlFor="priority-high">High</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="urgent" id="priority-urgent" />
                    <Label htmlFor="priority-urgent">Urgent</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex">
                <Input 
                  id="tags" 
                  placeholder="Add relevant tags (e.g., bug, styling, auth)"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="rounded-r-none"
                />
                <Button 
                  type="button" 
                  onClick={addTag}
                  className="rounded-l-none"
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {tag} tag</span>
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee">Suggested Assignee (Optional)</Label>
              <select 
                id="assignee" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a team member (optional)</option>
                <option value="user1">Alex Johnson</option>
                <option value="user2">Jamie Smith</option>
                <option value="user3">Taylor Swift</option>
                <option value="user4">Pat Miller</option>
                <option value="user5">Sam Wilson</option>
              </select>
              <p className="text-xs text-muted-foreground">
                If you know who might be best equipped to help, you can suggest them here.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/help-requests">Cancel</Link>
            </Button>
            <Button>Submit Request</Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
