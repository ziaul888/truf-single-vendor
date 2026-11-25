"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingSeries, type BookingSeries } from "@/hooks/useBookingSeries";
import { seriesPatternLabel, shortDate } from "@/lib/series-format";
import { formatEventTime } from "@/lib/slot-format";
import { Banknote, CircleStop, Repeat } from "lucide-react";
import { SeriesCollectDialog } from "./series-collect-dialog";
import { SeriesBookingList, SeriesSkippedList } from "./series-lists";
import { SeriesMonths, SeriesTotals } from "./series-months";
import { SeriesStopDialog } from "./series-stop-dialog";

function SeriesActions({ series, onCollect, onStop }: { series: BookingSeries; onCollect: () => void; onStop: () => void }) {
  return (
    <div className="flex gap-2">
      {series.totals.due > 0 && (
        <Button type="button" className="h-10 flex-1 sm:flex-none" onClick={onCollect}>
          <Banknote className="h-4 w-4" />Collect
        </Button>
      )}
      <Button type="button" variant="outline" onClick={onStop}
        className="h-10 flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex-none">
        <CircleStop className="h-4 w-4" />Stop repeat
      </Button>
    </div>
  );
}

function SeriesBody({ series, currentBookingId, onRefresh }: { series: BookingSeries; currentBookingId: string; onRefresh: () => void }) {
  const [dialog, setDialog] = useState<"collect" | "stop" | null>(null);
  const closeDialog = (open: boolean) => { if (!open) setDialog(null); };
  const active = series.status === "active";

  return (
    <CardContent className="space-y-4">
      <div className="space-y-1 text-sm">
        <p className="font-medium">{seriesPatternLabel(series)}</p>
        {!active && series.stoppedAt && <p className="text-xs text-muted-foreground">Stopped {formatEventTime(series.stoppedAt)}</p>}
        {active && !series.untilDate && series.bookedThrough && (
          <p className="text-xs text-muted-foreground">Booked through {shortDate(series.bookedThrough)}; more are added as slots open.</p>
        )}
      </div>
      <SeriesTotals totals={series.totals} />
      <SeriesMonths months={series.months} />
      {active && <SeriesActions series={series} onCollect={() => setDialog("collect")} onStop={() => setDialog("stop")} />}
      <div className="space-y-2">
        <SeriesBookingList bookings={series.bookings} currentId={currentBookingId} />
        <SeriesSkippedList skipped={series.skipped} />
      </div>
      {active && (
        <>
          <SeriesCollectDialog series={series} open={dialog === "collect"} onOpenChange={closeDialog} />
          <SeriesStopDialog series={series} open={dialog === "stop"} onOpenChange={closeDialog} onStale={onRefresh} />
        </>
      )}
    </CardContent>
  );
}

/** "Repeat booking" on a booking that belongs to a series: its pattern, money per month, and actions. */
export function SeriesCard({ seriesId, currentBookingId }: { seriesId: string; currentBookingId: string }) {
  const { data: series, isLoading, isError, refetch } = useBookingSeries(seriesId);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Repeat className="h-4 w-4 text-muted-foreground" />Repeat booking
        </CardTitle>
        {series && (
          <Badge variant={series.status === "active" ? "default" : "secondary"}>{series.status === "active" ? "Active" : "Stopped"}</Badge>
        )}
      </CardHeader>
      {isLoading ? (
        <CardContent className="space-y-3"><div className="h-5 w-3/4 animate-pulse rounded bg-muted" /><div className="h-16 animate-pulse rounded bg-muted" /></CardContent>
      ) : isError || !series ? (
        <CardContent className="flex items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">Couldn&apos;t load the repeat booking.</p>
          <Button variant="outline" className="h-10" onClick={() => refetch()}>Try again</Button>
        </CardContent>
      ) : (
        <SeriesBody series={series} currentBookingId={currentBookingId} onRefresh={() => { refetch(); }} />
      )}
    </Card>
  );
}
