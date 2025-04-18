import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PlusCircle,
  LayoutDashboard,
  Lightbulb,
  Wrench,
  Settings,
  Users,
  MessageSquare,
  ListPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center border-b px-4 gap-2">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <div className="bg-primary h-5 w-5 rounded" />
          <span>Reddit at Home</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        {/* Main Navigation */}
        <nav className="grid items-start px-2 text-sm font-medium mb-6">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground ${
              pathname === "/dashboard" 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "hover:bg-transparent"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/ideas"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground ${
              pathname === "/ideas" || pathname.startsWith("/ideas/") 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "hover:bg-transparent"
            }`}
          >
            <Lightbulb className="h-4 w-4" />
            Ideas
          </Link>
          <Link
            href="/posts"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground ${
              pathname === "/posts" || pathname.startsWith("/posts/") 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "hover:bg-transparent"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Posts
          </Link>
          <Link
            href="/tools"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground ${
              pathname === "/tools" 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "hover:bg-transparent"
            }`}
          >
            <Wrench className="h-4 w-4" />
            Tools
          </Link>
          <Link
            href="/feature-requests"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground ${
              pathname === "/feature-requests" || pathname.startsWith("/feature-requests/") 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "hover:bg-transparent"
            }`}
          >
            <ListPlus className="h-4 w-4" />
            Feature Requests
          </Link>
          <Link
            href="/users"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground ${
              pathname === "/users" || pathname.startsWith("/users/") 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "hover:bg-transparent"
            }`}
          >
            <Users className="h-4 w-4" />
            Users
          </Link>
          <Link
            href="/settings"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground ${
              pathname === "/settings" 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "hover:bg-transparent"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>

        {/* Secondary sections */}
      </div>
      <div className="mt-auto p-4">
        <Button className="w-full justify-start gap-2" size="sm">
          <PlusCircle className="h-4 w-4" />
          <span>New Idea</span>
        </Button>
      </div>
    </aside>
  );
}
