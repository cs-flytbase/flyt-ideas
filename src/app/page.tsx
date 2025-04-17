import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-b from-background to-muted pb-16 pt-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Collaborate, Ideate, and Build Together
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                The internal platform for sharing ideas, managing projects, and discovering tools.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="/ideas">
                <button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                  Explore Ideas
                </button>
              </a>
              <a href="/auth/signup">
                <button className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                  Sign Up
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-12 md:px-6 md:py-24">
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Idea Sharing</h3>
            <p className="text-muted-foreground">
              Share your ideas with the team and engage in Reddit-style threaded discussions to refine concepts collaboratively.
            </p>
          </div>
          <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
                <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                <rect width="7" height="5" x="7" y="7" rx="1" />
                <rect width="7" height="5" x="10" y="12" rx="1" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Project Management</h3>
            <p className="text-muted-foreground">
              Manage projects with shared checklists that update in real-time, enabling seamless team collaboration and progress tracking.
            </p>
          </div>
          <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Tools Directory</h3>
            <p className="text-muted-foreground">
              Discover and share tools that enhance productivity. Our AI assistant suggests tool combinations based on your specific needs.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-muted py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to start collaborating?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                Join your team and start creating, sharing, and building together.
              </p>
            </div>
            <a href="/auth/signup">
              <button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Get Started
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
