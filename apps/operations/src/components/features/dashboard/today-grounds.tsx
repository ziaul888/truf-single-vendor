"use client";

import { useState } from "react";
import Link from "next/link";
import { Banknote, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  slotEndHours,
  slotPriceLabel,
  slotStartHours,
  slotStartTime,
  slotTimeLabel,
  venueHourNow,
} from "@/lib/slot-format";
import { useDashboardToday } from "@/hooks/useDashboard";
import { useDashboardAudience } from "@/components/dashboard-audience";
import { useMe } from "@/hooks/useMe";
import type { SlotStatus } from "@/types/slot";
import type { TodayGround } from "@/types/dashboard";
import { CollectByIdDialog } from "./collect-by-id-dialog";

const SLOT_CLS: Record<SlotStatus, string> = {
  available: "bg-success/25",
  held: "bg-warning",
  booked: "bg-primary",
  blocked: "bg-destructive/60",
};
const SLOT_NAME: Record<SlotStatus, string> = {
  available: "Free",
  held: "Paying",
  booked: "Booked",
  blocked: "Blocked",
};

function Timeline({ g, nowHour, timeZone }: { g: TodayGround; nowHour: number; timeZone?: string }) {
  // turf-api sends the whole hour; add the minutes so a 16:30 slot isn't "now" at 16:10.
  const clock = venueHourNow(timeZone);
  const nowAt = Math.floor(clock) === nowHour ? clock : nowHour;
  return (
    <div
      className="flex h-6 gap-0.5"
      role="img"
      aria-label={`${g.groundName}: ${g.slots.booked} booked, ${g.slots.available} free, ${g.slots.blocked} blocked`}
    >
      {g.timeline.map((s) => {
        const [start, end] = [slotStartHours(s), slotEndHours(s)];
        const now = start <= nowAt && nowAt < end;
        return (
          <div
            key={slotStartTime(s)}
            title={`${slotTimeLabel(s)} · ${SLOT_NAME[s.status]}`}
            className={cn(
              "flex-1 rounded-sm",
              SLOT_CLS[s.status],
              end <= nowAt && "opacity-40",
              now && "ring-foreground ring-offset-card ring-2 ring-offset-1"
            )}
          />
        );
      })}
    </div>
  );
}

function GroundRow({
  g,
  nowHour,
  timeZone,
  onCollect,
}: {
  g: TodayGround;
  nowHour: number;
  timeZone?: string;
  onCollect: (id: string) => void;
}) {
  return (
    <div className="space-y-2.5 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Link href={`/dashboard/grounds/${g.groundId}`} className="font-semibold hover:underline">
          {g.groundName}{" "}
          <span className="text-muted-foreground text-xs font-normal capitalize">
            {[g.sport, g.format].filter(Boolean).join(" · ")}
          </span>
        </Link>
        {g.closedReason ? (
          <span className="bg-muted rounded-full px-2.5 py-0.5 text-xs font-medium">
            {g.closedReason}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs tabular-nums">
            {g.slots.booked} booked · {g.remainingFreeHours}h available
          </span>
        )}
      </div>

      {!g.closedReason && g.timeline.length > 0 && <Timeline g={g} nowHour={nowHour} timeZone={timeZone} />}

      {!g.closedReason && (
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Now{" "}
            </span>
            {g.current ? (
              <Link href={`/dashboard/bookings/${g.current.bookingId}`} className="hover:underline">
                {g.current.customerName} · {slotTimeLabel(g.current)}
              </Link>
            ) : (
              <span className="text-muted-foreground">Nobody playing</span>
            )}
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Next
            </span>
            {g.next ? (
              <>
                <Link
                  href={`/dashboard/bookings/${g.next.bookingId}`}
                  className="truncate hover:underline"
                >
                  {g.next.customerName} · {slotTimeLabel(g.next)}
                </Link>
                {g.next.due > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-10 gap-1 px-2 text-xs"
                    onClick={() => onCollect(g.next!.bookingId)}
                  >
                    <Banknote className="h-3.5 w-3.5" /> Collect {slotPriceLabel(g.next.due)}
                  </Button>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">No more bookings today</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** One row per active ground: today's slots as a strip, who's playing now and who's next. */
export function TodayGrounds() {
  const { data, isLoading, isError, isFetching, refetch } = useDashboardToday();
  const { data: me } = useMe(useDashboardAudience());
  const timeZone = me && "tenant" in me ? me.tenant.timezone : undefined;
  const [collecting, setCollecting] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader className="space-y-3 p-4 sm:p-6">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="text-muted-foreground h-4 w-4" />
            On the grounds today
          </CardTitle>
          <CardDescription>Who&apos;s playing now and who&apos;s next.</CardDescription>
        </div>
        <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
          {(Object.keys(SLOT_CLS) as SlotStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 rounded-sm", SLOT_CLS[s])} />
              {SLOT_NAME[s]}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-muted h-20 animate-pulse rounded" />
            ))}
          </div>
        ) : isError || !data ? (
          <div role="alert" className="space-y-3 text-sm">
            <p className="text-muted-foreground">Today&apos;s grounds couldn&apos;t be loaded.</p>
            <Button
              variant="outline"
              size="sm"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          </div>
        ) : data.grounds.length === 0 ? (
          <p className="text-muted-foreground text-sm">No active grounds.</p>
        ) : (
          <div className="divide-y">
            {data.grounds.map((g) => (
              <GroundRow key={g.groundId} g={g} nowHour={data.nowHour} timeZone={timeZone} onCollect={setCollecting} />
            ))}
          </div>
        )}
      </CardContent>
      <CollectByIdDialog bookingId={collecting} onClose={() => setCollecting(null)} />
    </Card>
  );
}
