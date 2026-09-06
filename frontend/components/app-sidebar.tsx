"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Settings,
    LogOut,
    Sliders,
    ChevronDown,
    ChevronRight,
    type LucideIcon,
    Users,
    BarChart3,
    FileText,
    FileClock,
    FilePlus2,
    ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarTrigger, useSidebar } from "./ui/sidebar";
import { Button } from "./ui/button";

type MenuSubItem = {
    title: string;
    url: string;
    icon: LucideIcon;
};

type MenuItem = {
    title: string;
    url: string;
    icon: LucideIcon;
    items?: MenuSubItem[];
};

const menuItems: MenuItem[] = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Personal Weekly Reports",
        url: "/personal-weekly-reports",
        icon: FileText,
        items: [
            {
                title: "History",
                url: "/personal-weekly-reports/history",
                icon: FileClock,
            },
            {
                title: "New Report",
                url: "/personal-weekly-reports/new",
                icon: FilePlus2,
            }
        ]
    }
];

const settingsMenuItems: MenuItem[] = [
    {
        title: "Admin Panel",
        url: "/settings/admin-panel",
        icon: Users,
        items: [
            {
                title: "User Management",
                url: "/settings/admin-panel/user-management",
                icon: Users,
            }
        ],
    },
    {
        title: "Settings",
        url: "/settings/general-settings",
        icon: Settings,
    },
]

const reviewMenuItem: MenuSubItem = {
    title: "Review Reports",
    url: "/reports/review",
    icon: ClipboardCheck,
};

function getInitials(firstName: string | null | undefined, lastName: string | null | undefined, email: string): string {
    if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    return email ? email[0].toUpperCase() : "?";
}

function UserMenu() {
    const { user, signOut, isLoading } = useAuth();
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    const router = useRouter();

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-9 w-full items-center gap-2 px-0 py-1" aria-label="Loading user profile">
                <span className="h-8 w-8 shrink-0 animate-pulse rounded-md bg-sidebar-accent" />
                {!isCollapsed && <span className="h-4 w-24 animate-pulse rounded bg-sidebar-accent" />}
            </div>
        );
    }

    if (!user) return null;

    const initials = getInitials(user.firstName, user.lastName, user.email);
    const displayName = user.firstName
        ? `${user.firstName} ${user.lastName ?? ""}`.trim()
        : user.email;

    return (
        <>
            <div className="relative" ref={menuRef}>
                <Button
                    id="user-menu-trigger"
                    variant="ghost"
                    onClick={() => setOpen((v) => !v)}
                    className={cn(
                        "flex items-center justify-between gap-2 h-9 px-0 py-1 rounded-md transition-colors w-full",
                        "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                    aria-expanded={open}
                    aria-haspopup="menu"
                >
                    {/* Avatar circle */}
                    <div className="flex items-center gap-2">
                        <span className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold select-none shrink-0">
                            {initials}
                        </span>

                        {!isCollapsed &&
                            <div className="flex flex-col justify-start">
                                <span className="hidden sm:block text-sm font-medium max-w-48 truncate">
                                    {displayName}
                                </span>
                                <span className="text-start text-xs text-foreground/50">
                                    {user.role}
                                </span>
                            </div>
                        }
                    </div>
                    {!isCollapsed &&
                        <ChevronRight
                            className={cn(
                                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                                open && "rotate-180"
                            )}
                        />
                    }
                </Button>

                {open && (
                    <div
                        role="menu"
                        className={cn(
                            "absolute left-full bottom-0 ml-2 w-56 z-50 rounded-lg border border-border bg-card shadow-lg py-1",
                            "animate-in fade-in-0 zoom-in-95 duration-150 origin-bottom-left"
                        )}
                    >
                        {/* User info header */}
                        <div className="px-3 py-2 border-b border-border">
                            <div>
                                {user.firstName && (
                                    <p className="text-sm font-medium leading-none mb-1">
                                        {displayName}
                                    </p>
                                )}
                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                {user.role && (
                                    <span className="mt-2 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                        {user.role}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Sign out */}
                        <button
                            id="sign-out-btn"
                            role="menuitem"
                            onClick={() => {
                                setOpen(false);
                                signOut();
                                router.push("/auth/signin");
                            }}
                            disabled={isLoading}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive",
                                "hover:bg-destructive/10 transition-colors duration-150",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            <LogOut className="h-4 w-4" />
                            {isLoading ? "Signing out..." : "Sign Out"}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default function AppSidebar() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    const pathname = usePathname();

    // State to track open/closed sub-menu groups
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        Configuration: true,
    });

    const toggleGroup = (title: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    const canAccessAdminPanel = !isAuthLoading && (user?.role === "admin" || user?.role === "manager");
    const visibleSettingsMenuItems = settingsMenuItems.filter(
        (item) => item.title !== "Admin Panel" || canAccessAdminPanel
    );
    const visibleMenuItems = canAccessAdminPanel
        ? [...menuItems, { title: "Report Review", url: "/reports", icon: ClipboardCheck, items: [reviewMenuItem] }]
        : menuItems;

    return (
        <Sidebar collapsible="icon" className="border-r border-border bg-sidebar text-sidebar-foreground">
            {/* Header */}
            <div className="flex h-14 items-center justify-between px-2 border-b border-border bg-sidebar">
                {!isCollapsed && (
                    <SidebarHeader className="flex items-center justify-center">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <p className="text-xl font-bold text-primary">TeamSync</p>
                        </Link>
                    </SidebarHeader>
                )}
                <SidebarTrigger className={cn("hover:bg-accent hover:text-accent-foreground cursor-pointer", isCollapsed ? "mx-auto" : "")} />
            </div>

            {/* Navigation Content */}
            <SidebarContent className="py-4">
                <SidebarGroup>
                    <SidebarGroupLabel className={cn(isCollapsed && "sr-only", "text-xs font-semibold text-muted-foreground tracking-wider px-3 mb-2 uppercase")}>
                        Main Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {visibleMenuItems.map((item) => {
                                // If it's a section with sub-items
                                if (item.items) {
                                    const hasActiveChild = item.items.some(
                                        (sub) => pathname === sub.url || pathname.startsWith(sub.url + "/")
                                    );
                                    const isOpen = !!openGroups[item.title];

                                    if (isCollapsed) {
                                        // When collapsed: render sub-items as flat top-level buttons with their icons
                                        return (
                                            <React.Fragment key={item.title}>
                                                {item.items.map((subItem) => {
                                                    const isSubActive = pathname === subItem.url || pathname.startsWith(subItem.url + "/");
                                                    return (
                                                        <SidebarMenuItem key={subItem.title}>
                                                            <SidebarMenuButton
                                                                asChild
                                                                isActive={isSubActive}
                                                                tooltip={`${item.title}: ${subItem.title}`}
                                                                className={cn(
                                                                    "w-full transition-all duration-200",
                                                                    isSubActive
                                                                        ? "bg-primary! text-primary-foreground! font-medium hover:bg-primary/70! hover:text-primary-foreground!"
                                                                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/60"
                                                                )}
                                                            >
                                                                <Link href={subItem.url} className="flex items-center gap-3">
                                                                    <subItem.icon className="h-5 w-5 shrink-0 text-current!" />
                                                                    <span>{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuButton>
                                                        </SidebarMenuItem>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    }

                                    // When expanded: render collapsible menu group
                                    return (
                                        <SidebarMenuItem key={item.title} className="space-y-1">
                                            <SidebarMenuButton
                                                onClick={() => toggleGroup(item.title)}
                                                className={cn(
                                                    "w-full flex items-center justify-between text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
                                                    hasActiveChild && "text-primary font-semibold"
                                                )}
                                                tooltip={item.title}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.icon ? (
                                                        <item.icon className="h-5 w-5 shrink-0" />
                                                    ) : (
                                                        <Sliders className="h-5 w-5 shrink-0" />
                                                    )}
                                                    <span>{item.title}</span>
                                                </div>
                                                {isOpen ? (
                                                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                                )}
                                            </SidebarMenuButton>

                                            {isOpen && (
                                                <SidebarMenuSub className="ml-0 border-l border-sidebar-border space-y-1 mt-1">
                                                    {item.items.map((subItem) => {
                                                        const isSubActive = pathname === subItem.url || pathname.startsWith(subItem.url + "/");
                                                        return (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton
                                                                    asChild
                                                                    isActive={isSubActive}
                                                                    className={cn(
                                                                        "w-full transition-all duration-200",
                                                                        isSubActive
                                                                            ? "bg-primary! text-primary-foreground! font-medium hover:bg-primary/70! hover:text-primary-foreground!"
                                                                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/60"
                                                                    )}
                                                                >
                                                                    <Link href={subItem.url} className="flex items-center gap-3">
                                                                        <subItem.icon className="h-4 w-4 shrink-0 text-current!" />
                                                                        <span>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        );
                                                    })}
                                                </SidebarMenuSub>
                                            )}
                                        </SidebarMenuItem>
                                    );
                                }

                                // Normal top-level item
                                const url = "url" in item ? item.url : undefined;
                                const Icon = "icon" in item ? item.icon : null;
                                if (!url) return null;

                                const isActive = pathname === url || pathname.startsWith(url + "/");
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className={cn(
                                                "w-full transition-all duration-200",
                                                isActive
                                                    ? "bg-primary! text-primary-foreground! font-medium hover:bg-primary/70! hover:text-primary-foreground!"
                                                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/70"
                                            )}
                                        >
                                            <Link href={url} className="flex items-center gap-3">
                                                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Separator / Management Group */}
                <SidebarGroup>
                    <SidebarGroupLabel className={cn(isCollapsed && "sr-only", "font-semibold text-muted-foreground tracking-wider px-3 mb-2 uppercase")}>
                        Settings
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {visibleSettingsMenuItems.map((item) => {
                                // If it's a section with sub-items
                                if (item.items) {
                                    const hasActiveChild = item.items.some(
                                        (sub) => pathname === sub.url || pathname.startsWith(sub.url + "/")
                                    );
                                    const isOpen = !!openGroups[item.title];

                                    if (isCollapsed) {
                                        // When collapsed: render sub-items as flat top-level buttons with their icons
                                        return (
                                            <React.Fragment key={item.title}>
                                                {item.items.map((subItem) => {
                                                    const isSubActive = pathname === subItem.url || pathname.startsWith(subItem.url + "/");
                                                    return (
                                                        <SidebarMenuItem key={subItem.title}>
                                                            <SidebarMenuButton
                                                                asChild
                                                                isActive={isSubActive}
                                                                tooltip={`${item.title}: ${subItem.title}`}
                                                                className={cn(
                                                                    "w-full transition-all duration-200",
                                                                    isSubActive
                                                                        ? "bg-primary! text-primary-foreground! font-medium hover:bg-primary/70! hover:text-primary-foreground!"
                                                                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/60"
                                                                )}
                                                            >
                                                                <Link href={subItem.url} className="flex items-center gap-3">
                                                                    <subItem.icon className="h-5 w-5 shrink-0 text-current!" />
                                                                    <span>{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuButton>
                                                        </SidebarMenuItem>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    }

                                    // When expanded: render collapsible menu group
                                    return (
                                        <SidebarMenuItem key={item.title} className="space-y-1">
                                            <SidebarMenuButton
                                                onClick={() => toggleGroup(item.title)}
                                                className={cn(
                                                    "w-full flex items-center justify-between text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
                                                    hasActiveChild && "text-primary font-semibold"
                                                )}
                                                tooltip={item.title}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.icon ? (
                                                        <item.icon className="h-5 w-5 shrink-0" />
                                                    ) : (
                                                        <Sliders className="h-5 w-5 shrink-0" />
                                                    )}
                                                    <span>{item.title}</span>
                                                </div>
                                                {isOpen ? (
                                                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                                )}
                                            </SidebarMenuButton>

                                            {isOpen && (
                                                <SidebarMenuSub className="ml-0 border-l border-sidebar-border space-y-1 mt-1">
                                                    {item.items.map((subItem) => {
                                                        const isSubActive = pathname === subItem.url || pathname.startsWith(subItem.url + "/");
                                                        return (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton
                                                                    asChild
                                                                    isActive={isSubActive}
                                                                    className={cn(
                                                                        "w-full transition-all duration-200",
                                                                        isSubActive
                                                                            ? "bg-primary! text-primary-foreground! font-medium hover:bg-primary/70! hover:text-primary-foreground!"
                                                                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/60"
                                                                    )}
                                                                >
                                                                    <Link href={subItem.url} className="flex items-center gap-3">
                                                                        <subItem.icon className="h-4 w-4 shrink-0 text-current!" />
                                                                        <span>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        );
                                                    })}
                                                </SidebarMenuSub>
                                            )}
                                        </SidebarMenuItem>
                                    );
                                }

                                // Normal top-level item
                                const url = "url" in item ? item.url : undefined;
                                const Icon = "icon" in item ? item.icon : null;
                                if (!url) return null;

                                const isActive = pathname === url || pathname.startsWith(url + "/");
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className={cn(
                                                "w-full transition-all duration-200",
                                                isActive
                                                    ? "bg-primary! text-primary-foreground! font-medium hover:bg-primary/70! hover:text-primary-foreground!"
                                                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/70"
                                            )}
                                        >
                                            <Link href={url} className="flex items-center gap-3">
                                                {Icon && <Icon className="h-5 w-5 shrink-0" />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer / User Profile */}
            <SidebarFooter className="py-4 border-t border-border bg-sidebar">
                <UserMenu />
            </SidebarFooter>
        </Sidebar>
    );
}