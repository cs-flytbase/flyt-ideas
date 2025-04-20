import React from "react";

interface ToolsCategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function ToolsCategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: ToolsCategoryFilterProps) {
  return (
    <div className="py-2 px-4 sm:px-6 lg:px-8">
      <h2 className="text-sm font-medium text-muted-foreground mb-2">
        Categories
      </h2>
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 overflow-x-auto pb-1.5 no-scrollbar">
        {categories.map((category, idx) => (
          <button
            key={idx}
            className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
              category === activeCategory
                ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            onClick={() => onCategoryChange(category)}
            aria-pressed={category === activeCategory}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
