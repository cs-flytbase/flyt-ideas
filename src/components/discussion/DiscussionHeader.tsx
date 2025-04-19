import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface DiscussionHeaderProps {
  title: string;
  creator?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
  created_at: string;
  tags?: string[];
  backLink: string;
  backLinkText: string;
}

export function DiscussionHeader({
  title,
  creator,
  created_at,
  tags,
  backLink,
  backLinkText,
}: DiscussionHeaderProps) {
  // Function to get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Back button */}
      <div className="mb-4 flex items-center">
        <Link
          href={backLink}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{backLinkText}</span>
        </Link>
      </div>

      {/* Author information */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="h-5 w-5 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
            {creator?.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt={creator?.display_name || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium">
                {getInitials(creator?.display_name || "User")}
              </span>
            )}
          </div>
          <Link
            href={`/users/${creator?.id}`}
            className="text-xs sm:text-sm font-medium hover:underline"
          >
            {creator?.display_name}
          </Link>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {new Date(created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-semibold leading-tight mb-3">
        {title}
      </h1>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((tag: string, i: number) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 bg-secondary/70 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
