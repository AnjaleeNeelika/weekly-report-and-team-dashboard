"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render a placeholder with the same dimensions to avoid layout shift
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative w-9 h-9 rounded-full"
        aria-label="Toggle theme"
      >
        <span className="w-5 h-5" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    // Briefly add .theme-transitioning to <html> so our CSS transition rule fires,
    // then remove it after the animation completes so it doesn't affect other effects.
    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    setTheme(isDark ? "light" : "dark");
    setTimeout(() => root.classList.remove("theme-transitioning"), 350);
  };

  return (
    <Button
      id="theme-toggle-btn"
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="relative w-9 h-9 rounded-full overflow-hidden transition-colors hover:bg-muted"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sun icon — visible in dark mode */}
      <Sun
        className={`absolute h-5 w-5 transition-all duration-500 ease-spring
          ${isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"}`}
      />
      {/* Moon icon — visible in light mode */}
      <Moon
        className={`absolute h-5 w-5 transition-all duration-500 ease-spring
          ${isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
      />
    </Button>
  );
}
