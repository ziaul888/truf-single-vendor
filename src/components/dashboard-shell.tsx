"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  // On lg+ default expanded; on md default collapsed; on mobile hidden (drawer)
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Initialise collapsed state based on screen width after hydration
  useEffect(() => {
    const init = () => {
      if (window.innerWidth < 1024) setCollapsed(true);
    };
    init();
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, static on md+ */}
      <div
        className={[
          // mobile: fixed drawer
          "fixed inset-y-0 left-0 z-50 lg:static lg:z-auto",
          // mobile visibility
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "transition-transform duration-300 ease-in-out",
        ].join(" ")}
      >
        <Sidebar
          collapsed={collapsed}
          onCollapse={setCollapsed}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setMobileOpen((o) => !o)} />
        <main className="flex-1 overflow-y-auto px-6 py-4 md:px-10 md:py-6">{children}</main>
      </div>
    </div>
  );
}
