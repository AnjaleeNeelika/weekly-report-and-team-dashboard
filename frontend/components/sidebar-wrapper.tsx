"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
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

    return (
        <SidebarProvider defaultOpen>
            {showSidebar ? (
                <div className="flex flex-1 w-full overflow-hidden">
                    <AppSidebar />
                    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                        <Navbar />
                        <main className="flex-1 overflow-y-auto">{children}</main>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col flex-1">
                    <Navbar />
                    <main className="flex-1">{children}</main>
                </div>
            )}
        </SidebarProvider>
    );
}