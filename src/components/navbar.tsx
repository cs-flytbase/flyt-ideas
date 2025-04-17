import Link from "next/link";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Flyt Ideas</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground/80"
            >
              Dashboard
            </Link>
            <Link
              href="/ideas"
              className="transition-colors hover:text-foreground/80"
            >
              Ideas
            </Link>
            <Link
              href="/tools"
              className="transition-colors hover:text-foreground/80"
            >
              Tools
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="block h-8 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
          <nav className="flex items-center">
            <Link href="/auth/login">
              <Button variant="outline" className="mr-2">
                Log in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign up</Button>
            </Link>
          </nav>
        </div>
      </div>
    </nav>
  );
}
