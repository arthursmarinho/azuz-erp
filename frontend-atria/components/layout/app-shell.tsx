"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { AppNavbar } from "./navbar";
import { MobileDrawer } from "./mobile-drawer";
import { FinanceDueAlertsWatcher } from "@/components/financial/finance-due-alerts-watcher";
import { TaskDetailProvider } from "@/components/kanban/task-detail-provider";
import { NotificationsProvider } from "@/contexts/notifications-context";
import { SidebarProvider } from "@/contexts/sidebar-context";

function isContentDeliveryPath(pathname: string | null) {
  if (!pathname) return false;
  return /^\/content\/[^/]+\/?$/.test(pathname);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const immersiveDelivery = isContentDeliveryPath(pathname);

  if (immersiveDelivery) {
    return (
      <TaskDetailProvider>
        <NotificationsProvider>
          <div className="min-h-screen w-full bg-[var(--atria-base)]">
            <main className="min-h-screen w-full">{children}</main>
          </div>
        </NotificationsProvider>
      </TaskDetailProvider>
    );
  }

  return (
    <TaskDetailProvider>
      <NotificationsProvider>
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden bg-[var(--atria-base)]">
            <div data-app-chrome className="contents">
              <AppSidebar />
              <MobileDrawer open={mobileOpen} onOpenChange={setMobileOpen} />
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div data-app-chrome>
                <AppNavbar onMenuClick={() => setMobileOpen(true)} />
              </div>
              <FinanceDueAlertsWatcher />

              <main className="flex-1 overflow-y-auto p-4 lg:p-6 xl:p-8">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </NotificationsProvider>
    </TaskDetailProvider>
  );
}
