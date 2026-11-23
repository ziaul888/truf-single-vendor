"use client";

import Link from "next/link";
import {
  AlarmClock,
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  Undo2,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { slotPriceLabel } from "@/lib/slot-format";
import { useDashboardAttention } from "@/hooks/useDashboard";
import type { DashboardAttention } from "@/types/dashboard";

interface AttentionItem {
  label: string;
  count: number;
  description: string;
  href: string;
  icon: LucideIcon;
  urgent?: boolean;
}

function confirmationDescription(data: DashboardAttention) {
  const parts = [
    data.toConfirm.payAtVenue ? `${data.toConfirm.payAtVenue} pay at venue` : "",
    data.toVerify?.count
      ? `${data.toVerify.count} wallet ${data.toVerify.count === 1 ? "payment" : "payments"} to verify`
      : "",
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Review and confirm these bookings";
}

/** A short action list: only show follow-ups that have work waiting. */
export function AttentionCards({ showRefundList }: { showRefundList: boolean }) {
  const { data, isLoading, isError, isFetching, refetch } = useDashboardAttention();

  if (isLoading) {
    return <div aria-label="Loading tasks" className="bg-muted h-24 animate-pulse rounded-lg" />;
  }

  if (isError || !data) {
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 text-sm"
      >
        <p>Pending tasks couldn&apos;t be loaded.</p>
        <Button variant="outline" size="sm" disabled={isFetching} onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const items: AttentionItem[] = [
    {
      label: "Overdue payments",
      count: data.overdue.count,
      description: `${slotPriceLabel(data.overdue.amount)} to collect`,
      href: "/dashboard/bookings?due=overdue",
      icon: AlertTriangle,
      urgent: true,
    },
    {
      label: "Confirm bookings",
      count: data.toConfirm.count,
      description: confirmationDescription(data),
      href: "/dashboard/bookings/confirmed",
      icon: CalendarCheck,
    },
    {
      label: "Payments due today",
      count: data.dueToday.count,
      description: `${slotPriceLabel(data.dueToday.amount)} to collect`,
      href: "/dashboard/bookings?due=today",
      icon: Wallet,
    },
  ];
  if (data.refundDue) {
    items.push({
      label: "Send refunds",
      count: data.refundDue.count,
      description: "Send manually, then record the refund",
      href: showRefundList ? "/dashboard/bookings/refunds?status=due" : "/dashboard/bookings?refundDue=true",
      icon: Undo2,
    });
  }
  const pending = items.filter((item) => item.count > 0);

  return (
    <Card>
      {pending.length > 0 ? (
        <>
          <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
            <CardTitle className="text-base">Needs your attention</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pt-0 pb-2 sm:px-3 sm:pb-3">
            <ul className="divide-border/60 divide-y">
              {pending.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:bg-muted/60 focus-visible:ring-ring flex min-h-18 items-center gap-3 rounded-lg px-2 py-3 focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        item.urgent
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning/10 text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{item.label}</span>
                      <span className="text-muted-foreground mt-0.5 block text-xs">
                        {item.description}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "bg-muted shrink-0 rounded-md px-2 py-1 text-sm font-semibold tabular-nums",
                        item.urgent && "bg-destructive/10 text-destructive"
                      )}
                    >
                      {item.count}
                    </span>
                    <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </>
      ) : (
        <div className="flex items-center gap-3 p-4 sm:p-5">
          <CheckCircle2 className="text-success h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-medium">No payment or confirmation tasks</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              You&apos;re up to date on confirmations, collections, and refunds.
            </p>
          </div>
        </div>
      )}

      {(data.startingSoon.count > 0 || data.payingNow.count > 0) && (
        <div className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-2 border-t px-4 py-3 text-xs sm:px-5">
          {data.startingSoon.count > 0 && (
            <Link
              href="#upcoming"
              className="hover:text-foreground flex min-h-8 items-center gap-1.5 hover:underline"
            >
              <AlarmClock className="h-3.5 w-3.5" />
              {data.startingSoon.count} starting in the next {data.startingSoon.withinMinutes} min
            </Link>
          )}
          {data.payingNow.count > 0 && (
            <span className="flex min-h-8 items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              {data.payingNow.count} in card checkout
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
