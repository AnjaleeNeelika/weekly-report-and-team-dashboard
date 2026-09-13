"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  History,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Settings,
  UsersRound,
  type LucideIcon,
  ClipboardCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type NavSubItem = {
    icon: LucideIcon;
  label: string;
  key: string;
  href: string;
};

type NavItem = {
  icon: LucideIcon;
  label: string;
  key: string;
  href: string;
  expandable?: boolean;
  subItems?: NavSubItem[];
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", key: "dashboard", href: "/overview" },
      {
        icon: FileText,
        label: "Personal Weekly Reports",
        key: "personal-weekly-reports",
        href: "/personal-weekly-reports",
        expandable: true,
        subItems: [
          { icon: History, label: "History", key: "history", href: "/personal-weekly-reports/history" },
          { icon: FilePlus2, label: "New Report", key: "new-report", href: "/personal-weekly-reports/new-report" },
        ],
      },
      {
        icon: FileText,
        label: "Report Reviews",
        key: "report-reviews",
        href: "/report-reviews",
        expandable: true,
        subItems: [
          { icon: ClipboardCheck, label: "Review Reports", key: "review-reports", href: "/report-reviews/review-reports" },
        ],
      },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      { icon: UsersRound, label: "Admin Panel", key: "admin-panel", href: "/admin-panel", expandable: true },
      { icon: Settings, label: "Settings", key: "settings", href: "/settings" },
    ],
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const isExactActive = (href: string) => pathname === href;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-3 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 shrink-0 text-primary" />
          <span className="text-lg font-semibold tracking-tight text-primary group-data-[collapsible=icon]:hidden">
            TeamSync
          </span>
          <SidebarTrigger className="ml-auto text-sidebar-foreground" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAV_SECTIONS.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      asChild
                      isActive={isExactActive(item.href)}
                      className={
                        item.subItems?.some((subItem) => isExactActive(subItem.href))
                          ? "text-primary hover:text-primary"
                          : undefined
                      }
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                        {item.expandable && (
                          isActive(item.href) ? (
                            <ChevronDown className="ml-auto text-primary" />
                          ) : (
                            <ChevronRight className="ml-auto" />
                          )
                        )}
                      </Link>
                    </SidebarMenuButton>
                    {item.subItems && (
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.key}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isExactActive(subItem.href)}
                              className={
                                isExactActive(subItem.href)
                                  ? "!bg-sidebar-primary !text-sidebar-primary-foreground hover:!bg-sidebar-primary/90 hover:!text-sidebar-primary-foreground [&>svg]:!text-sidebar-primary-foreground"
                                  : undefined
                              }
                            >
                              <Link href={subItem.href}>
                                <subItem.icon />
                                <span>{subItem.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-auto py-2" tooltip="Anjalee Neelika">
              <Avatar className="size-8 rounded-md" size="sm">
                <AvatarFallback className="rounded-md bg-primary/10 text-xs text-primary">
                  AN
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  Anjalee Neelika
                </p>
                <p className="truncate text-xs text-muted-foreground">admin</p>
              </div>
              <ChevronRight className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
