// app/ideas/[id]/page.tsx

import { MainLayout } from "@/components/main-layout";
import { Badge } from "@/components/ui/badge";

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  upvotes: number;
  replies?: Comment[];
}

const IdeaDetailPage = () => {
  // Mock data for the idea
  const idea = {
    id: 1,
    title: "Mobile App Redesign",
    description:
      "We need to revamp our mobile app interface with a more intuitive navigation and modern design elements. The current design is feeling dated and users are struggling with the navigation flow. I propose we take inspiration from some of the top productivity apps that have excellent UX/UI.",
    author: "Alex Chen",
    date: "2 days ago",
    upvotes: 24,
    tags: ["Design", "Mobile", "UX/UI"],
  };

  // Mock data for comments
  const comments: Comment[] = [
    {
      id: 1,
      author: "Jamie Taylor",
      content:
        "I completely agree with this. Our user testing showed that the navigation is the biggest pain point. We should prioritize that first.",
      date: "1 day ago",
      upvotes: 12,
      replies: [
        {
          id: 101,
          author: "Alex Chen",
          content:
            "Great point! I was thinking we could start with a navigation prototype in Figma to get early feedback.",
          date: "1 day ago",
          upvotes: 8,
        },
        {
          id: 102,
          author: "Morgan Smith",
          content:
            "We also need to consider accessibility improvements in the redesign. The current contrast ratios don't meet WCAG standards.",
          date: "22 hours ago",
          upvotes: 6,
          replies: [
            {
              id: 1021,
              author: "Riley Johnson",
              content:
                "I can help with the accessibility audit. I've been working on creating a comprehensive checklist for our projects.",
              date: "20 hours ago",
              upvotes: 4,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      author: "Taylor Lee",
      content:
        "Have we considered bringing in a dedicated UX designer for this project? It might be worth the investment for such a critical piece of our product.",
      date: "1 day ago",
      upvotes: 9,
      replies: [],
    },
    {
      id: 3,
      author: "Sam Wilson",
      content:
        "I'd like to see us incorporate some of the feedback from our customer support team. They hear directly from users about pain points.",
      date: "18 hours ago",
      upvotes: 7,
      replies: [],
    },
  ];

  // Function to render a comment and its replies recursively
  const renderComment = (comment: Comment, depth = 0) => {
    return (
      <div key={comment.id} className={`mb-4 ${depth > 0 ? "ml-8" : ""}`}>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-2 h-8 w-8 rounded-full bg-primary text-center text-xs font-semibold leading-8 text-primary-foreground">
                {comment.author.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{comment.author}</div>
                <div className="text-xs text-muted-foreground">{comment.date}</div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
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
                >
                  <path d="m5 15 7-7 7 7" />
                </svg>
              </button>
              <span className="text-sm font-semibold">{comment.upvotes}</span>
              <button className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
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
                >
                  <path d="m19 9-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-sm">{comment.content}</p>
          <div className="mt-3 flex text-xs text-muted-foreground">
            <button className="mr-3 flex items-center hover:text-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
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
              Reply
            </button>
            <button className="flex items-center hover:text-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="m3 21 1.9-5.7a9 9 0 1 1 3.8 3.8z" />
              </svg>
              Share
            </button>
          </div>
        </div>
        {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center space-x-2">
          <a href="/ideas" className="text-sm text-muted-foreground hover:text-foreground">
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
              className="inline mr-1 -mt-0.5"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Ideas
          </a>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex">
            <div className="mr-4 flex flex-col items-center">
              <button className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
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
              <span className="my-1 text-sm font-semibold">{idea.upvotes}</span>
              <button className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
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
              <h1 className="text-2xl font-bold">{idea.title}</h1>
              <div className="mb-4 mt-2 flex flex-wrap items-center gap-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="mr-2 h-5 w-5 rounded-full bg-primary text-center text-xs font-semibold leading-5 text-primary-foreground">
                    {idea.author.charAt(0)}
                  </div>
                  {idea.author}
                </div>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{idea.date}</span>
                {idea.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="whitespace-pre-line text-foreground">{idea.description}</p>
              <div className="mt-6 flex items-center space-x-4 text-sm text-muted-foreground">
                <button className="flex items-center hover:text-foreground">
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
                  {comments.length} Comments
                </button>
                <button className="flex items-center hover:text-foreground">
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
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                  Save
                </button>
                <button className="flex items-center hover:text-foreground">
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
                    <path d="m3 21 1.9-5.7a9 9 0 1 1 3.8 3.8z" />
                  </svg>
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Add a comment</h2>
          <textarea
            className="min-h-[100px] w-full rounded-md border bg-background p-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="What are your thoughts on this idea?"
          ></textarea>
          <div className="mt-2 flex justify-end">
            <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1">
              Comment
            </button>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Discussion ({comments.length})</h2>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <button className="inline-flex h-8 items-center justify-center rounded-full border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1">
                Best
              </button>
              <button className="inline-flex h-8 items-center justify-center rounded-full px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1">
                New
              </button>
              <button className="inline-flex h-8 items-center justify-center rounded-full px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1">
                Top
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {comments.map((comment) => renderComment(comment))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default IdeaDetailPage;
