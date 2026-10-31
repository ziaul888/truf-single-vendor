"use client";

import Link from "next/link";
import { AlarmClock, AlertTriangle, CalendarCheck, CreditCard, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { slotPriceLabel } from "@/lib/slot-format";
import { useDashboardAttention } from "@/hooks/useDashboard";

type Tone = "warn" | "crit" | "info";

const TONE: Record<Tone, string> = {
  warn: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200",
  crit: "border-red-300 bg-red-50 text-red-900 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200",
  info: "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200",
};

interface AttentionCard {
  label: string;
  count: number;
  sub: string;
  href?: string;
  tone: Tone;
  Icon: React.ElementType;
}

/** The action cards at the top: each one turns colored while it has something to do, and links to the list that clears it. */
export function AttentionCards() {
  const { data, isLoading } = useDashboardAttention();

  if (isLoading || !data) {
    return <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{[...Array(5)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted last:col-span-2 lg:last:col-span-1" />)}</div>;
  }

  const cards: AttentionCard[] = [
    {
      label: "To confirm", count: data.toConfirm.count, tone: "warn", Icon: CalendarCheck, href: "/dashboard/bookings/confirmed",
      sub: data.toConfirm.payAtVenue ? `${data.toConfirm.payAtVenue} pay at venue` : "Waiting for staff",
    },
    { label: "Overdue", count: data.overdue.count, tone: "crit", Icon: AlertTriangle, href: "/dashboard/bookings?due=overdue", sub: `${slotPriceLabel(data.overdue.amount)} to collect` },
    { label: "Due today", count: data.dueToday.count, tone: "warn", Icon: Wallet, href: "/dashboard/bookings?due=today", sub: `${slotPriceLabel(data.dueToday.amount)} to collect` },
    { label: "Starting soon", count: data.startingSoon.count, tone: "info", Icon: AlarmClock, href: "#upcoming", sub: `In the next ${data.startingSoon.withinMinutes} min` },
    { label: "Paying now", count: data.payingNow.count, tone: "info", Icon: CreditCard, sub: "Customers in card checkout" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {cards.map((c) => {
        const body = (
          <>
            <div className="flex items-center justify-between">
              <span className="truncate text-sm font-medium">{c.label}</span>
              <c.Icon className="h-4 w-4 opacity-70" />
            </div>
            <div className="mt-1 text-xl font-bold tabular-nums sm:text-2xl">{c.count}</div>
            <div className="truncate text-xs opacity-75">{c.count > 0 ? c.sub : "Nothing right now"}</div>
          </>
        );
        const cls = cn(
          // Two per row on phones; the fifth card spans the row so nothing sits alone.
          "block min-w-0 rounded-xl border p-3 transition-colors last:col-span-2 sm:p-4 lg:last:col-span-1",
          c.count > 0 ? TONE[c.tone] : "bg-card text-muted-foreground",
          c.href && "hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        );
        return c.href ? <Link key={c.label} href={c.href} className={cls}>{body}</Link> : <div key={c.label} className={cls}>{body}</div>;
      })}
    </div>
  );
}
