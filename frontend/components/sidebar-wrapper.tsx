"use client";

import { usePathname } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import AppSidebar from "./app-sidebar";
import Navbar from "./navbar";
import { BarChart3 } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/auth")) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex h-14 shrink-0 items-center border-b border-border px-4">
          <div className="flex items-center gap-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary font-semibold text-sidebar-primary-foreground">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            TeamSync
          </span>
        </div>
          <Navbar />
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    );
  }

  return (
    // <SidebarProvider>
    //   <AppSidebar />
    //   <main>
    //     <SidebarTrigger />
    //     {children}
    //   </main>
    // </SidebarProvider>

    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-15 shrink-0 items-center gap-2 border-b border-border px-4">
          <span className="text-sm text-muted-foreground"></span>
          <Navbar />
        </header>
        <main className="flex flex-1 flex-col w-full h-screen bg-slate-100 dark:bg-background">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
