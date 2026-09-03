"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import { Navbar } from "@/components/navbar";

const NO_SIDEBAR_EXACT = ["/", "/login", "/signup"];

export default function SidebarWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isNoSidebarRoute = NO_SIDEBAR_EXACT.includes(pathname) || pathname.startsWith("/auth");
    const showSidebar = !isNoSidebarRoute;

    // No sidebar: navbar spans full width WITH logo
    if (!showSidebar) {
        return (
            <div className="flex flex-col flex-1">
                <Navbar />
                <main className="flex-1">{children}</main>
            </div>
        );
    }

    // With sidebar: navbar spans remaining width, NO logo (sidebar has it)
    return (
        <SidebarProvider>
            <div className="flex flex-1 w-full overflow-hidden">
                <AppSidebar />
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    <Navbar />
                    <main className="flex-1 overflow-y-auto">
                        {/* <SidebarTrigger /> */}
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}