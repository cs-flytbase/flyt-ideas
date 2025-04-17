// app/dashboard/page.tsx

import { MainLayout } from "@/components/main-layout";
import { IdeaCard } from "@/components/idea-card";
import { Badge } from "@/components/ui/badge";

const DashboardPage = () => {
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
  ];

  // Mock data for checklists
  const checklists = [
    {
      id: 1,
      title: "Q2 Marketing Campaign",
      progress: 60,
      items: [
        { text: "Define campaign objectives", completed: true },
        { text: "Create content calendar", completed: true },
        { text: "Design social media assets", completed: true },
        { text: "Prepare email templates", completed: false },
        { text: "Set up analytics tracking", completed: false },
      ],
      collaborators: ["Alex", "Jamie", "Sam"],
    },
    {
      id: 2,
      title: "Product Launch",
      progress: 40,
      items: [
        { text: "Finalize feature set", completed: true },
        { text: "Complete user testing", completed: true },
        { text: "Prepare press release", completed: false },
        { text: "Update documentation", completed: false },
        { text: "Coordinate with sales team", completed: false },
      ],
      collaborators: ["Taylor", "Morgan", "Riley"],
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex space-x-2">
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
                <path d="M11 12H3" />
                <path d="m16 6-4 6 4 6" />
                <path d="M21 12h-5" />
              </svg>
              Filter
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2">
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="font-semibold">Your Ideas</h2>
                <a href="/ideas" className="text-sm text-primary hover:underline">
                  View All
                </a>
              </div>
              <div className="divide-y p-4">
                {ideas.map((idea) => (
                  <div key={idea.id} className="py-4 first:pt-0 last:pb-0">
                    <IdeaCard {...idea} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="border-b p-4">
                <h2 className="font-semibold">Active Collaborators</h2>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {["Alex", "Jamie", "Morgan", "Taylor", "Riley", "Sam"].map((user, i) => (
                    <div
                      key={i}
                      className="flex items-center rounded-full border px-3 py-1 text-sm"
                    >
                      <div className="mr-2 h-6 w-6 rounded-full bg-primary text-center text-xs font-semibold leading-6 text-primary-foreground">
                        {user.charAt(0)}
                      </div>
                      <span>{user}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm">
              <div className="border-b p-4">
                <h2 className="font-semibold">Popular Tags</h2>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {["Design", "Marketing", "Development", "Research", "UX", "Product"].map(
                    (tag, i) => (
                      <Badge key={i} variant="outline" className="cursor-pointer">
                        {tag}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Shared Checklists</h2>
            <button className="text-sm text-primary hover:underline">New Checklist</button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {checklists.map((checklist) => (
              <div key={checklist.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium">{checklist.title}</h3>
                  <Badge variant="outline">{checklist.progress}%</Badge>
                </div>
                <div className="mb-3 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${checklist.progress}%` }}
                  ></div>
                </div>
                <ul className="mb-4 space-y-2">
                  {checklist.items.map((item, idx) => (
                    <li key={idx} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        className="mr-2 h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                      />
                      <span className={item.completed ? "text-muted-foreground line-through" : ""}>
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex -space-x-2">
                    {checklist.collaborators.map((user, idx) => (
                      <div
                        key={idx}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground ring-2 ring-background"
                      >
                        {user.charAt(0)}
                      </div>
                    ))}
                  </div>
                  <span>Updated 2h ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
