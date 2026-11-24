"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Clock, House, Menu, Plus } from "lucide-react";
import { DialogTrigger } from "@radix-ui/react-dialog";
import type { LucideIcon } from "lucide-react";
import { useDashboardAttention } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";

const NEW_BOOKING = "/dashboard/bookings/new";

type TabKey = "home" | "bookings" | "new" | "slots";

const under = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

function activeTab(pathname: string): TabKey | null {
  if (pathname === "/dashboard") return "home";
  if (under(pathname, NEW_BOOKING)) return "new";
  if (under(pathname, "/dashboard/bookings")) return "bookings";
  if (under(pathname, "/dashboard/slots")) return "slots";
  return null;
}

const tabClass = (active: boolean) =>
  cn(
    "no-press relative flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-medium transition-colors active:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
    active ? "text-primary" : "text-muted-foreground"
  );

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="bg-destructive text-destructive-foreground absolute -top-0.5 left-1/2 ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function TabLink({
  href,
  label,
  Icon,
  active,
  badge = 0,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={tabClass(active)}>
      <span className="relative grid size-7 place-items-center">
        <Icon className="size-5" aria-hidden />
        <CountBadge count={badge} />
      </span>
      {label}
    </Link>
  );
}

function NewButton({ active }: { active: boolean }) {
  return (
    <Link
      href={NEW_BOOKING}
      aria-current={active ? "page" : undefined}
      aria-label="New booking"
      className={tabClass(active)}
    >
      <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-full">
        <Plus className="size-4" aria-hidden />
      </span>
      New
    </Link>
  );
}

/** Phone/tablet bottom navigation; the Menu tab opens the sidebar drawer. Hidden on lg+. */
export function AdminTabBar({ menuOpen }: { menuOpen: boolean }) {
  const pathname = usePathname().replace(/^\/admin(?=\/|$)/, "/dashboard");
  const { data: attention } = useDashboardAttention();
  const tab = activeTab(pathname);
  // toVerify is a subset of toConfirm, so toConfirm alone is the number waiting on staff.
  const waiting = attention?.toConfirm.count ?? 0;

  return (
    <nav
      data-tab-bar
      aria-label="Main"
      className="bg-card shrink-0 select-none border-t pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pb-[max(0.5rem,var(--dashboard-bottom))] lg:hidden"
    >
      <div className="flex h-14 items-stretch px-1">
        <TabLink href="/dashboard" label="Home" Icon={House} active={tab === "home"} />
        <TabLink
          href="/dashboard/bookings"
          label="Bookings"
          Icon={CalendarDays}
          active={tab === "bookings"}
          badge={waiting}
        />
        <NewButton active={tab === "new"} />
        <TabLink href="/dashboard/slots" label="Slots" Icon={Clock} active={tab === "slots"} />
        <DialogTrigger asChild>
          <button
            type="button"
            aria-expanded={menuOpen}
            className={tabClass(menuOpen || tab === null)}
          >
            <span className="grid size-7 place-items-center">
              <Menu className="pointer-events-none size-5" aria-hidden />
            </span>
            Menu
          </button>
        </DialogTrigger>
      </div>
    </nav>
  );
}
