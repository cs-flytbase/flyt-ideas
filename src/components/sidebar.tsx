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
  ListPlus,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-14 items-center border-b px-4 gap-2">
          <div className="flex flex-1 items-center gap-2 font-semibold text-lg">
            <div className="bg-primary h-5 w-5 rounded" />
            <span>Flyt Ideas</span>
          </div>
          {/* Mobile Close Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2 flex flex-col justify-between"> 
          {/* Main Navigation */} 
          <nav className="grid items-start px-2 text-sm font-medium"> 
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
          </nav>

          {/* Bottom Navigation Section */} 
          <nav className="grid items-start px-2 text-sm font-medium mt-auto pt-4 border-t border-border"> 
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
        </div>
      </aside>
    </>
  );
}
