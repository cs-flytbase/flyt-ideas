import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ToolsSuggestAreaProps {
  queryText: string;
  onQueryChange: (value: string) => void;
  onGetSuggestions: () => void;
  suggesting: boolean;
}

export function ToolsSuggestArea({
  queryText,
  onQueryChange,
  onGetSuggestions,
  suggesting,
}: ToolsSuggestAreaProps) {
  return (
    <div className="rounded-lg bg-card w-full p-2 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 shadow-sm border">
      <span className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <path d="M8.5 8.5 3 15l8.5 9 8.5-9-5.5-6.5L8.5 2 3 6l5.5 2.5Z" />
          <path d="M11 13 8.5 8.5 6 13l2.5 3 2.5-3Z" />
          <path d="M11 13h5.5l2.5-3-2.5-3h-5.5" />
          <path d="M11 13v6.5" />
          <path d="M3 6v9" />
          <path d="M20 6v9" />
          <path d="M14.5 5 11 3" />
        </svg>
      </span>
      <Input
        placeholder="Describe your problem..."
        value={queryText}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && queryText.trim() && onGetSuggestions()}
        className="w-full sm:flex-1 min-w-0"
      />
      <Button
        variant="outline"
        size="sm"
        className="w-full sm:w-auto flex-none mt-2 sm:mt-0"
        onClick={onGetSuggestions}
        disabled={suggesting || !queryText.trim()}
      >
        {suggesting && <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block align-middle" />}
        Get Suggestions
      </Button>
    </div>
  );
}
