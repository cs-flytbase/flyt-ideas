import Link from "next/link";
import { Badge } from "./ui/badge";

interface ToolCardProps {
  id: string | number;
  name: string;
  description: string;
  tags: string[];
  usageCount: number;
  powerUsers: string[];
  icon: React.ReactNode;
  className?: string;
}

export function ToolCard({
  id,
  name,
  description,
  tags,
  usageCount,
  powerUsers,
  icon,
  className,
}: ToolCardProps) {
  return (
    <div
      className={`${className} rounded-lg border bg-card p-3 sm:p-4 shadow-sm transition-all hover:shadow-md`}
    >
      <div className="mb-2 sm:mb-3 flex items-center">
        <div className="mr-2 sm:mr-3 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
        <Link href={`/tools/${id}`} className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold hover:text-primary">{name}</h3>
        </Link>
      </div>
      <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-muted-foreground">
        {description}
      </p>
      <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1">
        {tags.map((tag, i) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="mt-2 sm:mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="M2 12h20" />
            <path d="M16 6 22 12 16 18" />
          </svg>
          <span>{usageCount} uses</span>
        </div>
        <div className="flex -space-x-2">
          {powerUsers.slice(0, 3).map((user, i) => (
            <div
              key={i}
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] font-bold text-primary-foreground"
              title={user}
            >
              {user.slice(0, 1).toUpperCase()}
            </div>
          ))}
          {powerUsers.length > 3 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold text-muted-foreground">
              +{powerUsers.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
