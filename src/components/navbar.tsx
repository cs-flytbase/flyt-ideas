"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { NotificationsMenu } from "./notifications";

interface NavbarProps {
  isTransparent?: boolean;
}

export function Navbar({ isTransparent = false }: NavbarProps) {
  return (
    <nav className={`sticky top-0 z-40 w-full ${isTransparent ? 'bg-transparent border-transparent' : 'border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'}`}>
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-lg font-bold">Flyt Ideas</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/ideas"
              className="transition-colors hover:text-primary"
            >
              Ideas
            </Link>
            <Link
              href="/tools"
              className="transition-colors hover:text-primary"
            >
              Tools
            </Link>
            <Link
              href="/help-requests"
              className="transition-colors hover:text-primary"
            >
              Help Requests
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="block h-9 w-full rounded-md border bg-background/80 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              />
            </div>
          </div>
          <nav className="flex items-center">
            <SignedIn>
              {/* User is signed in */}
              <div className="flex items-center gap-2">
                <NotificationsMenu />
                <UserButton 
                  afterSignOutUrl="/sign-in"
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9"
                    }
                  }}
                />
              </div>
            </SignedIn>
            <SignedOut>
              {/* User is not signed in */}
              <Link href="/sign-in">
                <Button variant="outline" className="mr-2 h-9">
                  Log in
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="h-9">Sign up</Button>
              </Link>
            </SignedOut>
          </nav>
        </div>
      </div>
    </nav>
  );
}
