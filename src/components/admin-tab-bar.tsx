"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Clock, House, Menu, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDashboardAttention } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

const NEW_BOOKING = "/dashboard/bookings/new";

type TabKey = "home" | "bookings" | "new" | "slots";

const under = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

function activeTab(pathname: string): TabKey | null {
  if (pathname === "/dashboard") return "home";
  if (under(pathname, NEW_BOOKING)) return "new";
  if (under(pathname, "/dashboard/bookings")) return "bookings";
  if (under(pathname, "/dashboard/slots")) return "slots";
  return null;
}

const tabClass = (active: boolean) =>
  cn(
    "relative flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-transform active:scale-95",
    active ? "text-primary" : "text-muted-foreground",
  );

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1.5 left-1/2 ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-destructive-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function TabLink({ href, label, Icon, active, badge = 0 }: {
  href: string; label: string; Icon: LucideIcon; active: boolean; badge?: number;
}) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={tabClass(active)}>
      <span className="relative">
        <Icon className="h-5 w-5" />
        <CountBadge count={badge} />
      </span>
      {label}
    </Link>
  );
}

function NewButton({ active }: { active: boolean }) {
  return (
    <Link href={NEW_BOOKING} aria-current={active ? "page" : undefined} aria-label="New booking" className={tabClass(active)}>
      <span className="relative z-10 -mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-card">
        <Plus className="h-6 w-6" />
      </span>
      New
    </Link>
  );
}

/** Phone/tablet bottom navigation; the Menu tab opens the sidebar drawer. Hidden on lg+. */
export function AdminTabBar({ menuOpen, onMenuClick }: { menuOpen: boolean; onMenuClick: () => void }) {
  const pathname = usePathname();
  const { data: attention } = useDashboardAttention();
  const tab = activeTab(pathname);
  // toVerify is a subset of toConfirm, so toConfirm alone is the number waiting on staff.
  const waiting = attention?.toConfirm.count ?? 0;

  return (
    <nav
      data-tab-bar
      aria-label="Main"
      className="shrink-0 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur select-none lg:hidden"
    >
      <div className="flex h-14 items-stretch px-1">
        <TabLink href="/dashboard" label="Home" Icon={House} active={tab === "home"} />
        <TabLink href="/dashboard/bookings" label="Bookings" Icon={CalendarDays} active={tab === "bookings"} badge={waiting} />
        <NewButton active={tab === "new"} />
        <TabLink href="/dashboard/slots" label="Slots" Icon={Clock} active={tab === "slots"} />
        <button type="button" onClick={onMenuClick} aria-expanded={menuOpen} className={tabClass(menuOpen || tab === null)}>
          <Menu className="h-5 w-5" />
          Menu
        </button>
      </div>
    </nav>
  );
}
