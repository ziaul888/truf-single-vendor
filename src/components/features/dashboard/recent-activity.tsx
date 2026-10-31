"use client";

import Link from "next/link";
import { History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRecentActivity } from "@/hooks/useDashboard";
import { EVENT_DOT_CLASS, EVENT_LABEL, eventDetailLabel, timeAgo } from "@/components/features/bookings/booking-status-helpers";

/** The latest booking events across the venue: payments, confirmations, cancellations, refunds. */
export function RecentActivity() {
  const { data, isLoading, isError } = useRecentActivity(10);
  const events = data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-muted" />)}</div>
        ) : isError ? (
          <p className="text-sm text-destructive">Couldn&apos;t load recent activity.</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing has happened yet.</p>
        ) : (
          <ol className="space-y-3">
            {events.map((e) => (
              <li key={e.id} className="flex gap-3 text-sm">
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", EVENT_DOT_CLASS[e.type])} aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="font-medium">
                      {EVENT_LABEL[e.type]}{" "}
                      <Link href={`/dashboard/bookings/${e.booking.id}`} className="font-mono text-xs font-normal text-muted-foreground hover:underline">
                        {e.booking.bookingNumber}
                      </Link>
                    </p>
                    <time dateTime={e.createdAt} title={new Date(e.createdAt).toLocaleString()} className="text-xs text-muted-foreground">
                      {timeAgo(e.createdAt)}
                    </time>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.booking.customerName} · {e.booking.groundName}
                    {e.detail && ` · ${eventDetailLabel(e.detail)}`}
                    {` · ${e.user?.name ?? "Automatic"}`}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
