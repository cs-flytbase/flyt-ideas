import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ToolsHeaderProps {
  onAdd: () => void;
}

export function ToolsHeader({ onAdd }: ToolsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
          Tools Directory
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 truncate">
          Discover and share tools that enhance productivity
        </p>
      </div>
      <Button
        size="sm"
        className="inline-flex items-center justify-center h-9 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 transition-colors"
        onClick={onAdd}
      >
        <Plus className="mr-1.5 h-4 w-4" />
        <span>Add Tool</span>
      </Button>
    </div>
  );
}
