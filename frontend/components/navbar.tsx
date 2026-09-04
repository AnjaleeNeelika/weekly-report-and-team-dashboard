"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "./ui/sidebar";

/** Routes on which the Navbar is hidden entirely (e.g. full-screen app shells
 *  that provide their own sidebar/header). */
const HIDDEN_ON: string[] = [];

/** Routes on which the Sign In button should NOT appear. */
const AUTH_ROUTES = ["/auth"];

export function Navbar() {
  const { user, isLoading } = useAuth();
  const { state } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";

  const pathname = usePathname();

  if (HIDDEN_ON.some((route) => pathname.startsWith(route))) return null;

  const showSignIn = !isLoading && !user && !AUTH_ROUTES.some((route) => pathname.startsWith(route));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-md">
      <div className="mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        {isSidebarCollapsed &&
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
          >
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-primary">TeamSync</span>
          </Link>
        }

        {/* Right-side controls */}
        <nav className="flex items-center gap-2 justify-end w-full">
          {showSignIn && (
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
