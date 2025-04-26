"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IdeaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  isPublic: boolean;
  status: string;
  tags: string[];
  isCreating: boolean;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onIsPublicChange: (value: boolean) => void;
  onStatusChange: (value: string) => void;
  onTagsChange: (value: string[]) => void;
  dialogTitle: string;
  dialogDescription: string;
  saveButtonText: string;
}

export function IdeaDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  isPublic,
  status,
  tags,
  isCreating,
  onSave,
  onCancel,
  onTitleChange,
  onDescriptionChange,
  onIsPublicChange,
  onStatusChange,
  onTagsChange,
  dialogTitle,
  dialogDescription,
  saveButtonText
}: IdeaDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="col-span-3"
              placeholder="Enter a clear, descriptive title"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="col-span-3"
              rows={4}
              placeholder="Describe your idea in detail"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <div className="col-span-3">
              <Select value={status} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full">  
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tags" className="text-right">
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
            <Label htmlFor="visibility" className="text-right">
              Visibility
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                id="visibility"
                checked={isPublic}
                onCheckedChange={onIsPublicChange}
              />
              <Label htmlFor="visibility" className="cursor-pointer">
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
            disabled={isCreating || !title.trim()}
          >
            {isCreating ? "Saving..." : saveButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
