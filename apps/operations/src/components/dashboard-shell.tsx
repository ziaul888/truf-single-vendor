"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { AdminTabBar } from "@/components/admin-tab-bar";
import { useMe, type DashboardAudience } from "@/hooks/useMe";
import { DashboardAudienceProvider } from "@/components/dashboard-audience";
import { TenantDashboardContent } from "@/components/tenant-dashboard-content";
import { DashboardAccent } from "@/components/dashboard-accent";
import { cn } from "@/lib/utils";
import styles from "./dashboard-shell.module.css";

const DESKTOP_QUERY = "(min-width: 1024px)";

export function DashboardShell({
  children,
  audience = "staff",
}: {
  children: React.ReactNode;
  audience?: DashboardAudience;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: me } = useMe(audience);
  const tenant = me && "tenant" in me ? me.tenant : undefined;

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
    <DashboardAudienceProvider audience={audience}>
      <DashboardAccent scope="turf" id={tenant?.status === "suspended" ? undefined : tenant?.id} />
      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        {/* The tab bar steps aside while a page shows its own MobileActionBar. */}
        <div className={cn("bg-background flex h-dvh overflow-hidden has-[[data-mobile-action-bar]]:[&_[data-tab-bar]]:hidden", styles.shell)}>
          <div className="hidden lg:block">
            <Sidebar collapsed={collapsed} onCollapse={setCollapsed} audience={audience} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Topbar audience={audience} />
            <main className={cn("relative flex-1 overflow-y-auto py-4 md:py-6", styles.content)}>
              {audience === "owner" ? <TenantDashboardContent>{children}</TenantDashboardContent> : children}
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
              audience={audience}
              onClose={() => setMobileOpen(false)}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </DashboardAudienceProvider>
  );
}
