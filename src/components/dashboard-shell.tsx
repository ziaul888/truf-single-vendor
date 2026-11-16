"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { AdminTabBar } from "@/components/admin-tab-bar";

const DESKTOP_QUERY = "(min-width: 1024px)";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const sync = () => {
      if (mq.matches) setMobileOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
      {/* The tab bar steps aside while a page shows its own MobileActionBar. */}
      <div className="bg-background flex h-dvh overflow-hidden has-[[data-mobile-action-bar]]:[&_[data-tab-bar]]:hidden">
        <div className="hidden lg:block">
          <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 md:px-10 md:py-6">
            {children}
          </main>
          <AdminTabBar menuOpen={mobileOpen} />
        </div>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 lg:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 outline-none lg:hidden"
        >
          <Dialog.Title className="sr-only">Admin navigation menu</Dialog.Title>
          <Sidebar
            collapsed={false}
            onCollapse={setCollapsed}
            drawer
            onClose={() => setMobileOpen(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
