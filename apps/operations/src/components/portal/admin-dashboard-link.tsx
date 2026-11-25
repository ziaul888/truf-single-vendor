"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { useIsAdmin } from "@/components/portal/account/use-admin-hint";

/** The header's Dashboard button for a signed-in admin (md and up; phones have it in the menu). */
export function AdminDashboardLink() {
  if (!useIsAdmin()) return null;
  return (
    <Link
      href="/dashboard"
      className="hidden h-10 items-center gap-1.5 rounded-lg border border-accent/40 px-3 text-sm font-semibold text-accent hover:bg-accent hover:text-accent-foreground md:inline-flex"
    >
      <LayoutDashboard className="h-4 w-4" />
      <span className="hidden sm:inline">Dashboard</span>
    </Link>
  );
}
