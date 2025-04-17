// app/tools/page.tsx

import { MainLayout } from "@/components/main-layout";
import { ToolCard } from "@/components/tool-card";
import { Badge } from "@/components/ui/badge";

const ToolsPage = () => {
  // Tool icons as React components
  const toolIcons = {
    figma: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 3a3 3 0 0 1 3 3m-3-3a3 3 0 0 0-3 3m3-3v1M9 3a3 3 0 0 0-3 3m3-3a3 3 0 0 1 3 3m-3-3v1M3 9a3 3 0 0 1 3-3M3 9a3 3 0 0 0 3 3M3 9H2m19 0a3 3 0 0 0-3-3m3 3a3 3 0 0 1-3 3m3-3h1M9 21a3 3 0 0 1-3-3m3 3a3 3 0 0 0 3-3m-3 3v-1m6 1a3 3 0 0 0 3-3m-3 3a3 3 0 0 1-3-3m3 3v-1m-9-9a3 3 0 0 0-3 3m3-3a3 3 0 0 1 3 3m-3-3v1m12-1a3 3 0 0 1 3 3m-3-3a3 3 0 0 0-3 3m3-3v1" />
      </svg>
    ),
    github: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    ),
    notion: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M7 7h10" />
        <path d="M7 12h10" />
        <path d="M7 17h10" />
      </svg>
    ),
    slack: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="13" y="2" width="3" height="8" rx="1.5" />
        <path d="M19 8.5V10" />
        <rect x="8" y="14" width="3" height="8" rx="1.5" />
        <path d="M5 15.5V14" />
        <rect x="14" y="13" width="8" height="3" rx="1.5" />
        <path d="M15.5 19H14" />
        <rect x="2" y="8" width="8" height="3" rx="1.5" />
        <path d="M8.5 5H10" />
      </svg>
    ),
    google: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
        <line x1="12" x2="12" y1="2" y2="12" />
      </svg>
    ),
    linear: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  };

  // Mock data for tools
  const tools = [
    {
      id: 1,
      name: "Figma",
      description: "Design, prototype, and collaborate all in the browser with this powerful design tool.",
      tags: ["Design", "Collaboration", "Prototyping"],
      usageCount: 78,
      powerUsers: ["Alex", "Jamie", "Casey"],
      icon: toolIcons.figma,
    },
    {
      id: 2,
      name: "GitHub",
      description: "A platform for version control and collaboration for software developers.",
      tags: ["Development", "Collaboration", "Version Control"],
      usageCount: 152,
      powerUsers: ["Morgan", "Riley", "Taylor", "Sam"],
      icon: toolIcons.github,
    },
    {
      id: 3,
      name: "Notion",
      description: "All-in-one workspace for notes, tasks, wikis, and databases.",
      tags: ["Productivity", "Documentation", "Collaboration"],
      usageCount: 104,
      powerUsers: ["Casey", "Alex", "Jamie"],
      icon: toolIcons.notion,
    },
    {
      id: 4,
      name: "Slack",
      description: "Channel-based messaging platform for team communication.",
      tags: ["Communication", "Collaboration", "Productivity"],
      usageCount: 187,
      powerUsers: ["Riley", "Morgan", "Taylor"],
      icon: toolIcons.slack,
    },
    {
      id: 5,
      name: "Google Workspace",
      description: "Suite of cloud computing, productivity and collaboration tools.",
      tags: ["Productivity", "Collaboration", "Cloud"],
      usageCount: 165,
      powerUsers: ["Sam", "Casey", "Jamie"],
      icon: toolIcons.google,
    },
    {
      id: 6,
      name: "Linear",
      description: "Issue tracking tool designed for modern software development teams.",
      tags: ["Development", "Project Management", "Issue Tracking"],
      usageCount: 62,
      powerUsers: ["Riley", "Morgan", "Alex"],
      icon: toolIcons.linear,
    },
  ];

  // Popular categories for filtering
  const categories = [
    "All",
    "Design",
    "Development",
    "Productivity",
    "Collaboration",
    "Communication",
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Tools Directory</h1>
            <p className="text-muted-foreground">
              Discover and share tools that enhance productivity
            </p>
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
              Add Tool
            </button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M8.5 8.5 3 15l8.5 9 8.5-9-5.5-6.5L8.5 2 3 6l5.5 2.5Z" />
              <path d="M11 13 8.5 8.5 6 13l2.5 3 2.5-3Z" />
              <path d="M11 13h5.5l2.5-3-2.5-3h-5.5" />
              <path d="M11 13v6.5" />
              <path d="M3 6v9" />
              <path d="M20 6v9" />
              <path d="M14.5 5 11 3" />
            </svg>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Describe your problem, and I'll suggest the right tools..."
                className="w-full rounded-md border-0 bg-transparent px-3 py-2 text-base shadow-none focus:outline-none focus:ring-0"
              />
            </div>
            <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1">
              Get Suggestions
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

        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.id} {...tool} />
            ))}
          </div>

          <div className="flex items-center justify-center">
            <button className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1">
              Load More
            </button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-medium">AI Tool Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Here's a suggestion based on your recent queries:
            </p>
          </div>
          <div className="mb-6 rounded-lg bg-muted p-4">
            <p className="mb-2 font-medium">For cross-platform design with collaboration:</p>
            <div className="flex flex-wrap gap-2">
              <div className="rounded-md bg-background p-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-md bg-primary/10 p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M15 3a3 3 0 0 1 3 3m-3-3a3 3 0 0 0-3 3m3-3v1M9 3a3 3 0 0 0-3 3m3-3a3 3 0 0 1 3 3m-3-3v1M3 9a3 3 0 0 1 3-3M3 9a3 3 0 0 0 3 3M3 9H2m19 0a3 3 0 0 0-3-3m3 3a3 3 0 0 1-3 3m3-3h1M9 21a3 3 0 0 1-3-3m3 3a3 3 0 0 0 3-3m-3 3v-1m6 1a3 3 0 0 0 3-3m-3 3a3 3 0 0 1-3-3m3 3v-1m-9-9a3 3 0 0 0-3 3m3-3a3 3 0 0 1 3 3m-3-3v1m12-1a3 3 0 0 1 3 3m-3-3a3 3 0 0 0-3 3m3-3v1" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Figma</div>
                    <div className="text-xs text-muted-foreground">Design & Prototyping</div>
                  </div>
                </div>
              </div>
              <div className="rounded-md bg-background p-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-md bg-primary/10 p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M7 7h10" />
                      <path d="M7 12h10" />
                      <path d="M7 17h10" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Notion</div>
                    <div className="text-xs text-muted-foreground">Documentation</div>
                  </div>
                </div>
              </div>
              <div className="rounded-md bg-background p-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-md bg-primary/10 p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <path d="M18 7 4 17l8.5 9 8.5-9-5.5-6.5L18 7z" />
                      <path d="M11 13 8.5 8.5 6 13l2.5 3 2.5-3Z" />
                      <path d="M11 13h5.5l2.5-3-2.5-3h-5.5" />
                      <path d="M11 13v6.5" />
                      <path d="M3 6v9" />
                      <path d="M20 6v9" />
                      <path d="M14.5 5 11 3" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium">Slack</div>
                    <div className="text-xs text-muted-foreground">Communication</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            This combination is popular among design teams who need to collaborate
            across different platforms while maintaining thorough documentation.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ToolsPage;
