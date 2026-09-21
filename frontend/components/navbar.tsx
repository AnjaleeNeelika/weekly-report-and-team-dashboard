"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export default function Navbar() {
    const { resolvedTheme, setTheme } = useTheme();
    const isDark = resolvedTheme === "light";

    return (
        <nav className="ml-auto flex items-center">
            <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                title="Toggle theme"
                onClick={() => setTheme(isDark ? "light" : "dark")}
            >
                <Sun className="dark:hidden" />
                <Moon className="hidden dark:block" />
            </Button>
        </nav>
    );
}