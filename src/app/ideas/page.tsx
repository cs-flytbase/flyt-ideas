// app/ideas/page.tsx

import { MainLayout } from "@/components/main-layout";
import { IdeaCard } from "@/components/idea-card";
import { Badge } from "@/components/ui/badge";

const IdeasPage = () => {
  // Mock data for ideas
  const ideas = [
    {
      id: 1,
      title: "Mobile App Redesign",
      description: "Revamp our mobile app interface with a more intuitive navigation and modern design elements.",
      author: "Alex Chen",
      date: "2 days ago",
      commentCount: 8,
      upvotes: 24,
    },
    {
      id: 2,
      title: "Customer Feedback System",
      description: "Implement a streamlined process for collecting and analyzing customer feedback across all platforms.",
      author: "Jamie Taylor",
      date: "3 days ago",
      commentCount: 12,
      upvotes: 18,
    },
    {
      id: 3,
      title: "AI-Powered Content Recommendations",
      description: "Create a machine learning algorithm that suggests relevant content based on user behavior and preferences.",
      author: "Morgan Smith",
      date: "5 days ago",
      commentCount: 15,
      upvotes: 32,
    },
    {
      id: 4,
      title: "Cross-Platform Integration Framework",
      description: "Build a framework that allows seamless integration between our various software products and third-party tools.",
      author: "Riley Johnson",
      date: "1 week ago",
      commentCount: 7,
      upvotes: 21,
    },
    {
      id: 5,
      title: "Automated Test Suite Enhancement",
      description: "Develop a more comprehensive automated testing system to improve code quality and reduce bugs in production.",
      author: "Taylor Lee",
      date: "1 week ago",
      commentCount: 9,
      upvotes: 15,
    },
  ];

  // Categories for filtering
  const categories = [
    "All",
    "Product",
    "Design",
    "Engineering",
    "Marketing",
    "Research",
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Ideas</h1>
            <p className="text-muted-foreground">Browse and discuss ideas from the team</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1">
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
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              New Idea
            </button>
            <button className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1">
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
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                <polyline points="7.5 19.79 7.5 14.6 3 12" />
                <polyline points="21 12 16.5 14.6 16.5 19.79" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              Sort
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {categories.map((category, i) => (
            <button
              key={i}
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                category === "All"
                  ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                  : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex space-x-4">
          <div className="flex-1 space-y-4">
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="font-semibold">Trending Ideas</h2>
                <div className="flex items-center space-x-2">
                  <select className="h-8 rounded-md border border-input bg-background px-2 py-1 text-xs">
                    <option>Newest</option>
                    <option>Most Upvoted</option>
                    <option>Most Discussed</option>
                  </select>
                </div>
              </div>
              <div className="divide-y p-4">
                {ideas.map((idea) => (
                  <div key={idea.id} className="py-4 first:pt-0 last:pb-0">
                    <IdeaCard {...idea} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <button className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1">
                Load More
              </button>
            </div>
          </div>

          <div className="hidden w-72 space-y-6 lg:block">
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h3 className="mb-4 font-semibold">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Design System",
                  "UI/UX",
                  "API",
                  "Mobile",
                  "Workflow",
                  "Testing",
                  "Performance",
                  "Security",
                  "Feature Request",
                  "Bug Fix",
                ].map((tag, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <h3 className="mb-4 font-semibold">Top Contributors</h3>
              <div className="space-y-3">
                {[
                  { name: "Alex Chen", ideas: 24, avatar: "A" },
                  { name: "Jamie Taylor", ideas: 18, avatar: "J" },
                  { name: "Morgan Smith", ideas: 15, avatar: "M" },
                  { name: "Riley Johnson", ideas: 12, avatar: "R" },
                  { name: "Taylor Lee", ideas: 9, avatar: "T" },
                ].map((user, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {user.avatar}
                      </div>
                      <span className="text-sm">{user.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {user.ideas} ideas
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default IdeasPage;
