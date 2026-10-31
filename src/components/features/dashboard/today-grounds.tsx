"use client";

import { useState } from "react";
import Link from "next/link";
import { Banknote, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { hourLabel, slotPriceLabel, slotTimeLabel } from "@/lib/slot-format";
import { useDashboardToday } from "@/hooks/useDashboard";
import type { SlotStatus } from "@/types/slot";
import type { TodayGround } from "@/types/dashboard";
import { CollectByIdDialog } from "./collect-by-id-dialog";

const SLOT_CLS: Record<SlotStatus, string> = {
  available: "bg-emerald-500/25",
  held: "bg-amber-400",
  booked: "bg-primary",
  blocked: "bg-red-400/70",
};
const SLOT_NAME: Record<SlotStatus, string> = { available: "Free", held: "Paying", booked: "Booked", blocked: "Blocked" };

function Timeline({ g, nowHour }: { g: TodayGround; nowHour: number }) {
  return (
    <div className="flex h-6 gap-0.5" role="img" aria-label={`${g.groundName}: ${g.slots.booked} booked, ${g.slots.available} free, ${g.slots.blocked} blocked`}>
      {g.timeline.map((s) => {
        const now = s.startHour <= nowHour && nowHour < s.endHour;
        return (
          <div key={s.startHour}
            title={`${hourLabel(s.startHour)}–${hourLabel(s.endHour)} · ${SLOT_NAME[s.status]}`}
            className={cn("flex-1 rounded-sm", SLOT_CLS[s.status], s.endHour <= nowHour && "opacity-40", now && "ring-2 ring-foreground ring-offset-1 ring-offset-card")} />
        );
      })}
    </div>
  );
}

function GroundRow({ g, nowHour, onCollect }: { g: TodayGround; nowHour: number; onCollect: (id: string) => void }) {
  return (
    <div className="space-y-2.5 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Link href={`/dashboard/grounds/${g.groundId}`} className="font-semibold hover:underline">
          {g.groundName} <span className="text-xs font-normal capitalize text-muted-foreground">{[g.sport, g.format].filter(Boolean).join(" · ")}</span>
        </Link>
        {g.closedReason ? (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{g.closedReason}</span>
        ) : (
          <span className="text-xs text-muted-foreground tabular-nums">
            {g.slots.booked} booked · {g.remainingFreeHours}h free left · {slotPriceLabel(g.revenueToday)} today
          </span>
        )}
      </div>

      {!g.closedReason && g.timeline.length > 0 && <Timeline g={g} nowHour={nowHour} />}

      {!g.closedReason && (
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Now </span>
            {g.current
              ? <Link href={`/dashboard/bookings/${g.current.bookingId}`} className="hover:underline">{g.current.customerName} · {slotTimeLabel(g.current)}</Link>
              : <span className="text-muted-foreground">Nobody playing</span>}
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next</span>
            {g.next ? (
              <>
                <Link href={`/dashboard/bookings/${g.next.bookingId}`} className="truncate hover:underline">{g.next.customerName} · {slotTimeLabel(g.next)}</Link>
                {g.next.due > 0 && (
                  <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-xs" onClick={() => onCollect(g.next!.bookingId)}>
                    <Banknote className="h-3.5 w-3.5" /> Collect {slotPriceLabel(g.next.due)}
                  </Button>
                )}
              </>
            ) : <span className="text-muted-foreground">No more bookings today</span>}
          </div>
        </div>
      )}
    </div>
  );
}

/** One row per active ground: today's slots as a strip, who's playing now and who's next. */
export function TodayGrounds() {
  const { data, isLoading, isError } = useDashboardToday();
  const [collecting, setCollecting] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Today&apos;s Grounds</CardTitle>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {(Object.keys(SLOT_CLS) as SlotStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5"><span className={cn("h-2.5 w-2.5 rounded-sm", SLOT_CLS[s])} />{SLOT_NAME[s]}</span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded bg-muted" />)}</div>
        ) : isError || !data ? (
          <p className="text-sm text-destructive">Couldn&apos;t load today&apos;s grounds.</p>
        ) : data.grounds.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active grounds.</p>
        ) : (
          <div className="divide-y">
            {data.grounds.map((g) => <GroundRow key={g.groundId} g={g} nowHour={data.nowHour} onCollect={setCollecting} />)}
          </div>
        )}
      </CardContent>
      <CollectByIdDialog bookingId={collecting} onClose={() => setCollecting(null)} />
    </Card>
  );
}
