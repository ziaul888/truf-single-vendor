"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ground } from "@/types/api";
import type { PublicClosure, PublicSlot } from "@/types/slot";
import { formatPeakRanges, fromMinorUnits } from "@/lib/ground-format";
import { addDays, venueToday } from "@/lib/slot-format";
import { SkeletonBlock } from "@/components/portal/loading/skeleton-block";

const SERVICE_FEE = 50;
/** Days offered in the picker; turf-api returns at most 14 per request. */
const DAYS_SHOWN = 7;

/** Real availability and prices from turf-api for the picker's whole date strip. */
function usePublicSlots(groundId: string, from: string, to: string) {
  return useQuery<PublicSlot[]>({
    queryKey: ["public-slots", groundId, from, to],
    queryFn: async () => {
      const res = await fetch(`/api/v1/grounds/${groundId}/slots?from=${from}&to=${to}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Could not load slots");
      return json.data;
    },
    staleTime: 30_000,
  });
}

/** Venue closures overlapping the picker's dates, so a closed day can say why ("Closed for Eid"). */
function usePublicClosures(from: string, to: string) {
  return useQuery<PublicClosure[]>({
    queryKey: ["public-closures", from, to],
    queryFn: async () => {
      const res = await fetch(`/api/v1/closures?from=${from}&to=${to}`);
      const json = await res.json();
      return json.success ? json.data : [];
    },
    staleTime: 60_000,
  });
}

/** A closure covers a ground on a date when it lists no grounds (all) or includes this one. */
const closureFor = (closures: PublicClosure[], groundId: string, date: string) =>
  closures.find((c) => date >= c.fromDate && date <= c.toDate && (c.groundIds.length === 0 || c.groundIds.includes(groundId)));

export function SlotPicker({ ground }: { ground: Ground }) {
  const router = useRouter();
  const dates = useMemo(() => buildDates(DAYS_SHOWN), []);
  const [activeDate, setActiveDate] = useState(dates[0].iso);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const { data: allSlots, isLoading, isError } = usePublicSlots(ground.id, dates[0].iso, dates[dates.length - 1].iso);
  const daySlots = (allSlots ?? []).filter((s) => s.date === activeDate);
  const { data: closures } = usePublicClosures(dates[0].iso, dates[dates.length - 1].iso);
  const closure = closureFor(closures ?? [], ground.id, activeDate);
  const selected = daySlots.find((s) => s.startHour === selectedHour);
  const slotHours = (ground.slotDurationMinutes ?? 60) / 60;
  const price = selected ? fromMinorUnits(selected.price) : null;
  const total = price != null ? price + SERVICE_FEE : null;

  function handleContinue() {
    if (!selected) return;
    const params = new URLSearchParams({
      groundId: ground.id,
      date: activeDate,
      hour: String(selectedHour),
    });
    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-1 flex items-baseline gap-2">
        <p className="text-2xl font-bold">৳{ground.hourlyRate.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">/ hour</p>
      </div>
      {ground.peakRate && (
        <p className="mb-5 text-xs text-muted-foreground">
          Peak ★ slots ৳{ground.peakRate.toLocaleString()}/hr · {formatPeakRanges(ground.peakRanges ?? [])}
        </p>
      )}

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Select date
      </p>
      {/* Thin, theme-coloured scrollbar that only shows on hover (no white track on the dark card) */}
      <div className="scrollbar-hover -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
        {dates.map((d) => (
          <button
            key={d.iso}
            onClick={() => { setActiveDate(d.iso); setSelectedHour(null); }}
            className={cn(
              "min-w-16 shrink-0 snap-start rounded-xl border p-2.5 text-center text-xs",
              activeDate === d.iso ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/40"
            )}
          >
            <p className="opacity-70">{d.dow}</p>
            <p className="text-lg font-bold">{d.day}</p>
            <p className="text-[10px] opacity-70">{d.mon}</p>
          </button>
        ))}
      </div>

      <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Available hours
      </p>
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} className="h-10 rounded-lg" />)}
        </div>
      ) : isError ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">Couldn&apos;t load slots. Please refresh.</p>
      ) : daySlots.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          {closure ? closure.label : "Closed on this day."}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {daySlots.map(({ startHour, available, isPeak }) => {
            const isSelected = selectedHour === startHour;
            return (
              <button
                key={startHour}
                disabled={!available}
                onClick={() => setSelectedHour(startHour)}
                className={cn(
                  "rounded-lg border px-2 py-2.5 text-sm transition",
                  !available && "cursor-not-allowed bg-muted/50 text-muted-foreground line-through",
                  available && !isSelected && "hover:border-primary",
                  isSelected && "bg-primary text-primary-foreground border-primary"
                )}
              >
                {pad(startHour)}:00 {isPeak && <span className="text-accent">★</span>}
              </button>
            );
          })}
        </div>
      )}

      {total != null && (
        <div className="mt-5 space-y-1.5 border-t pt-4 text-sm">
          <Row label={slotHours === 1 ? "1 hr slot" : `${slotHours} hr slot`} value={`৳${price!.toLocaleString()}`} />
          <Row label="Service fee" value={`৳${SERVICE_FEE}`} />
          <Row label="Total" value={`৳${total.toLocaleString()}`} bold />
        </div>
      )}

      <button
        disabled={!selected}
        onClick={handleContinue}
        className={cn(
          "mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold",
          !selected
            ? "cursor-not-allowed bg-muted text-muted-foreground"
            : "bg-accent text-accent-foreground hover:opacity-90"
        )}
      >
        Continue to payment <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between", bold && "border-t pt-2 text-base font-bold")}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/** The next `count` venue-local dates (slot dates are Asia/Dhaka, not the browser's timezone). */
function buildDates(count: number) {
  const dows = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const mons = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const first = venueToday();
  return Array.from({ length: count }, (_, i) => {
    const iso = addDays(first, i);
    const d = new Date(`${iso}T00:00:00Z`);
    return { iso, dow: dows[d.getUTCDay()], day: pad(d.getUTCDate()), mon: mons[d.getUTCMonth()] };
  });
}

const pad = (n: number) => n.toString().padStart(2, "0");
