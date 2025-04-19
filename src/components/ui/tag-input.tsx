"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";

interface TagInputProps {
  placeholder?: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  suggestions?: string[];
  onInputChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function TagInput({
  placeholder = "Add tags...",
  tags,
  setTags,
  suggestions = [],
  onInputChange,
  className,
  disabled = false,
}: TagInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = React.useState<string>("");
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [filteredSuggestions, setFilteredSuggestions] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (inputValue.length > 0) {
      const filtered = suggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [inputValue, suggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onInputChange?.(value);

    if (value.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = inputValue.trim();

    if ((e.key === "Enter" || e.key === ",") && value) {
      e.preventDefault();
      
      if (!tags.includes(value)) {
        setTags([...tags, value]);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !value && tags.length > 0) {
      e.preventDefault();
      const newTags = [...tags];
      newTags.pop();
      setTags(newTags);
    }
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag) && tag.trim() !== "") {
      setTags([...tags, tag]);
      setInputValue("");
      setIsOpen(false);
      inputRef.current?.focus();
    }
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
  };

  // Create a ref for the container to detect clicks outside
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  
  // Handle clicks outside to close the suggestions
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <div
        className="flex flex-wrap gap-2 p-1 border rounded-md min-h-10 items-center bg-background text-sm cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              className="flex items-center justify-center rounded-full hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          type="text"
          placeholder={tags.length === 0 ? placeholder : ""}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none min-w-20 px-1 py-0.5"
          onFocus={() => setIsOpen(true)}
          disabled={disabled}
        />
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-popover rounded-md border shadow-md overflow-auto max-h-56">
          <div className="p-2">
            <p className="text-xs text-muted-foreground mb-2">Suggestions (click to add)</p>
            <div className="flex flex-wrap gap-2">
              {filteredSuggestions.map((suggestion) => (
                <Badge 
                  key={suggestion} 
                  variant="outline"
                  className="cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => addTag(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
