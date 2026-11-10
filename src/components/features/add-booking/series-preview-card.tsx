"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dayDate, shortDate, SKIP_REASON_LABEL } from "@/lib/series-format";
import { slotPriceLabel } from "@/lib/slot-format";
import { cn } from "@/lib/utils";
import type { SeriesPreview, SeriesPreviewDate } from "@/types/booking-series";
import { Check, Loader2, Repeat, X } from "lucide-react";

/** Dates shown before "Show all". */
const FIRST_DATES = 6;

interface SeriesPreviewCardProps {
  preview?: SeriesPreview;
  /** The pattern is complete, so a preview was asked for. */
  ready: boolean;
  /** Checking the dates (the list may be the previous pattern's meanwhile). */
  loading: boolean;
  /** Why the dates couldn't be checked, or null. */
  error: string | null;
  onRetry: () => void;
  ongoing: boolean;
  className?: string;
}

const bookingsLabel = (n: number) => `${n} ${n === 1 ? "booking" : "bookings"}`;

function Summary({ preview, ongoing }: { preview: SeriesPreview; ongoing: boolean }) {
  return (
    <div className="rounded-lg bg-primary/5 px-3 py-2.5">
      <p className="text-lg font-bold text-primary">{bookingsLabel(preview.bookableCount)} · {slotPriceLabel(preview.total)}</p>
      {ongoing && (
        <p className="text-xs text-muted-foreground">
          {bookingsLabel(preview.bookableCount)} now (through {shortDate(preview.horizon)}), more added as slots open
        </p>
      )}
    </div>
  );
}

function DateRow({ d }: { d: SeriesPreviewDate }) {
  return (
    <li className="flex items-center gap-2.5 py-2 text-sm">
      <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
        d.available ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400")}>
        {d.available ? <Check className="h-3.5 w-3.5" aria-label="Free" /> : <X className="h-3.5 w-3.5" aria-label="Busy" />}
      </span>
      <span className={cn("flex-1 font-medium", !d.available && "text-muted-foreground line-through")}>{dayDate(d.date)}</span>
      <span className={cn("text-right text-xs", d.available ? "font-semibold tabular-nums" : "text-destructive")}>
        {d.available ? (d.price !== null ? slotPriceLabel(d.price) : "—") : SKIP_REASON_LABEL[d.reason ?? "no_slot"]}
      </span>
    </li>
  );
}

function Body({ preview, ready, loading, error, onRetry, ongoing }: Omit<SeriesPreviewCardProps, "className">) {
  const [showAll, setShowAll] = useState(false);
  if (!ready) {
    return (
      <p className="text-sm text-muted-foreground">
        {ongoing ? "Pick the days and time" : "Pick the days, time and an end date (up to 30 days after the start)"} to see which dates are free.
      </p>
    );
  }
  if (error && !loading) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-destructive">Couldn&apos;t check the dates: {error}</p>
        <Button type="button" variant="outline" className="h-10" onClick={onRetry}>Try again</Button>
      </div>
    );
  }
  if (!preview) return <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Checking dates…</p>;

  const dates = showAll ? preview.dates : preview.dates.slice(0, FIRST_DATES);
  return (
    <div className={cn("space-y-3 transition-opacity", loading && "opacity-60")}>
      <Summary preview={preview} ongoing={ongoing} />
      {preview.dates.length === 0 ? (
        <p className="text-sm text-muted-foreground">No dates match these days.</p>
      ) : (
        <ul className="divide-y">{dates.map((d) => <DateRow key={d.date} d={d} />)}</ul>
      )}
      {preview.dates.length > FIRST_DATES && (
        <Button type="button" variant="ghost" className="h-10 w-full" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show fewer" : `Show all ${preview.dates.length} dates`}
        </Button>
      )}
    </div>
  );
}

/** Which dates of the repeat pattern will be booked (✓) or skipped (✗ and why), and the total. */
export function SeriesPreviewCard({ className, ...props }: SeriesPreviewCardProps) {
  return (
    <Card className={cn("space-y-3 p-4 sm:p-5", className)}>
      <div className="flex items-center gap-2">
        <Repeat className="h-4 w-4 text-primary" />
        <p className="flex-1 text-sm font-semibold">Repeat dates</p>
        {props.loading && props.preview && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      <Body {...props} />
    </Card>
  );
}
