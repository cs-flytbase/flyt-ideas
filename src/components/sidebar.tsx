import Link from "next/link";

export function Sidebar() {
  return (
    <div className="hidden border-r bg-sidebar text-sidebar-foreground md:block md:w-64 lg:w-72">
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto py-2">
          <div className="px-4 py-2">
            <h2 className="mb-2 text-lg font-semibold">Workspaces</h2>
            <nav className="flex flex-col space-y-1">
              <Link
                href="/dashboard"
                className="rounded-md px-2 py-1.5 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                Personal
              </Link>
              <Link
                href="/dashboard"
                className="rounded-md px-2 py-1.5 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                Team Alpha
              </Link>
            </nav>
          </div>
          <div className="px-4 py-2">
            <h2 className="mb-2 text-lg font-semibold">Recent Ideas</h2>
            <nav className="flex flex-col space-y-1">
              {[
                "Mobile App Redesign",
                "Marketing Campaign",
                "Product Roadmap",
                "Customer Feedback System",
              ].map((idea, i) => (
                <Link
                  key={i}
                  href={`/ideas/${i + 1}`}
                  className="rounded-md px-2 py-1.5 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  {idea}
                </Link>
              ))}
            </nav>
          </div>
          <div className="px-4 py-2">
            <h2 className="mb-2 text-lg font-semibold">Tools</h2>
            <nav className="flex flex-col space-y-1">
              {[
                "Figma",
                "GitHub",
                "Notion",
                "Slack",
                "Google Workspace",
              ].map((tool, i) => (
                <Link
                  key={i}
                  href={`/tools/${i + 1}`}
                  className="rounded-md px-2 py-1.5 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  {tool}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary"></div>
              <div>
                <p className="text-sm font-medium">User Name</p>
                <p className="text-xs text-sidebar-foreground/70">user@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
