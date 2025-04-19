"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "@/components/ui/tag-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  description: string;
  isPublic: boolean;
  tags: string[];
  isProcessing: boolean;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onIsPublicChange: (value: boolean) => void;
  onTagsChange: (value: string[]) => void;
  dialogTitle: string;
  dialogDescription: string;
  saveButtonText: string;
}

export function PostDialog({
  isOpen,
  onOpenChange,
  title,
  content,
  description,
  isPublic,
  tags,
  isProcessing,
  onSave,
  onCancel,
  onTitleChange,
  onContentChange,
  onDescriptionChange,
  onIsPublicChange,
  onTagsChange,
  dialogTitle,
  dialogDescription,
  saveButtonText
}: PostDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="post-title" className="text-right">
              Title*
            </Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="col-span-3"
              placeholder="Enter an engaging title for your post"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="post-content" className="text-right pt-2">
              Content*
            </Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="col-span-3"
              rows={8}
              placeholder="Write your post content. You can use markdown for formatting."
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="post-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="post-description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="col-span-3"
              rows={3}
              placeholder="A brief summary of your post (optional)"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="post-tags" className="text-right">
              Tags
            </Label>
            <div className="col-span-3">
              <TagInput
                tags={tags}
                setTags={onTagsChange}
                suggestions={["technology", "ai", "project", "design", "development", "feature", "bug", "enhancement", "mobile", "web"]}
                placeholder="Add tags (press Enter or comma to add)"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="post-visibility" className="text-right">
              Visibility
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                id="post-visibility"
                checked={isPublic}
                onCheckedChange={onIsPublicChange}
              />
              <Label htmlFor="post-visibility" className="cursor-pointer">
                {isPublic ? "Public" : "Private"}
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            disabled={isProcessing || !title.trim() || !content.trim()}
          >
            {isProcessing ? "Saving..." : saveButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
