"use client";

import Link from "next/link";
import { useState } from 'react';
import { usePathname } from "next/navigation";
import {
  Search,
  Menu
} from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { UserProvider } from "@/contexts/UserContext";
import { Sidebar } from "@/components/sidebar";
import { NotificationsMenu } from "@/components/notifications";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <UserProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={isMobileSidebarOpen} onClose={toggleMobileSidebar} />

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Navbar */}
          <header className="h-16 border-b px-4 flex items-center justify-between bg-background">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden mr-2" 
                onClick={toggleMobileSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>

            </div>
            <div className="flex items-center gap-2">
              <NotificationsMenu />
              <UserButton afterSignOutUrl="/" />
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </UserProvider>
  );
}
