import Link from "next/link";

interface IdeaCardProps {
  id: string | number;
  title: string;
  description: string;
  author: string;
  date: string;
  commentCount: number;
  upvotes: number;
}

export function IdeaCard({
  id,
  title,
  description,
  author,
  date,
  commentCount,
  upvotes,
}: IdeaCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex">
        <div className="mr-4 flex flex-col items-center">
          <button className="text-foreground/70 hover:text-primary">
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
            >
              <path d="m5 15 7-7 7 7" />
            </svg>
          </button>
          <span className="my-1 text-sm font-semibold">{upvotes}</span>
          <button className="text-foreground/70 hover:text-destructive">
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
            >
              <path d="m19 9-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className="flex-1">
          <Link href={`/ideas/${id}`}>
            <h3 className="text-lg font-semibold hover:text-primary">{title}</h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span>Posted by {author}</span>
              <span>•</span>
              <span>{date}</span>
            </div>
            <div className="flex items-center">
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
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>{commentCount} comments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
