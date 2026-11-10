"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ground } from "@/types/api";
import type { PublicClosure, PublicSlot } from "@/types/slot";
import { formatPeakRanges, fromMinorUnits } from "@/lib/ground-format";
import { addDays, slotStartMinute, slotStartTime, venueToday } from "@/lib/slot-format";
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

/** `initialDate` ("YYYY-MM-DD", e.g. from the home search) is preselected when it is in the strip. */
export function SlotPicker({ ground, initialDate }: { ground: Ground; initialDate?: string }) {
  const router = useRouter();
  const dates = useMemo(() => buildDates(DAYS_SHOWN), []);
  const [activeDate, setActiveDate] = useState(
    dates.find((d) => d.iso === initialDate)?.iso ?? dates[0].iso,
  );
  /** The picked slot's start, "16:30": 90-minute slots start on half hours. */
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { data: allSlots, isLoading, isError } = usePublicSlots(ground.id, dates[0].iso, dates[dates.length - 1].iso);
  const daySlots = (allSlots ?? []).filter((s) => s.date === activeDate);
  const { data: closures } = usePublicClosures(dates[0].iso, dates[dates.length - 1].iso);
  const closure = closureFor(closures ?? [], ground.id, activeDate);
  const selected = daySlots.find((s) => slotStartTime(s) === selectedTime);
  const price = selected ? fromMinorUnits(selected.price) : null;
  const total = price != null ? price + SERVICE_FEE : null;

  function handleContinue() {
    if (!selected) return;
    const params = new URLSearchParams({
      groundId: ground.id,
      date: activeDate,
      hour: String(selected.startHour),
    });
    // Only half-hour starts add `minute`, so whole-hour links stay as they were.
    if (slotStartMinute(selected)) params.set("minute", String(slotStartMinute(selected)));
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
      <DateStrip dates={dates} active={activeDate} onPick={(iso) => { setActiveDate(iso); setSelectedTime(null); }} />

      <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Available hours
      </p>
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} className="h-11 rounded-lg" />)}
        </div>
      ) : isError ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">Couldn&apos;t load slots. Please refresh.</p>
      ) : daySlots.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          {closure ? closure.label : "Closed on this day."}
        </p>
      ) : (
        <HourGrid slots={daySlots} selected={selectedTime} onPick={setSelectedTime} />
      )}

      {total != null && (
        <div className="mt-5 space-y-1.5 border-t pt-4 text-sm">
          <Row label={slotLabel(ground.slotDurationMinutes ?? 60)} value={`৳${price!.toLocaleString()}`} />
          <Row label="Service fee" value={`৳${SERVICE_FEE}`} />
          <Row label="Total" value={`৳${total.toLocaleString()}`} bold />
        </div>
      )}

      {/* Once an hour is picked, phones continue from the sticky bar instead */}
      <button
        disabled={!selected}
        onClick={handleContinue}
        className={cn(
          "mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold",
          !selected
            ? "cursor-not-allowed bg-muted text-muted-foreground"
            : "max-lg:hidden bg-accent text-accent-foreground hover:opacity-90"
        )}
      >
        Continue to payment <ArrowRight className="h-4 w-4" />
      </button>
      {selected && total != null && (
        <MobileContinueBar time={slotStartTime(selected)} total={total} onContinue={handleContinue} />
      )}
    </div>
  );
}

/** The 7-day strip; on phones a fade at the right edge hints that it scrolls. */
function DateStrip({
  dates, active, onPick,
}: {
  dates: ReturnType<typeof buildDates>; active: string; onPick: (iso: string) => void;
}) {
  return (
    <div className="relative">
      {/* Thin, theme-coloured scrollbar that only shows on hover (no white track on the dark card) */}
      <div className="scrollbar-hover -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
        {dates.map((d) => (
          <button
            key={d.iso}
            onClick={() => onPick(d.iso)}
            className={cn(
              "min-w-16 shrink-0 snap-start rounded-xl border p-2.5 text-center text-xs",
              active === d.iso ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/40"
            )}
          >
            <p className="opacity-70">{d.dow}</p>
            <p className="text-lg font-bold">{d.day}</p>
            <p className="text-[10px] opacity-70">{d.mon}</p>
          </button>
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 -right-1 w-8 bg-linear-to-l from-card to-transparent lg:hidden" />
    </div>
  );
}

function HourGrid({
  slots, selected, onPick,
}: {
  slots: PublicSlot[]; selected: string | null; onPick: (time: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => {
        const { available, isPeak } = slot;
        const time = slotStartTime(slot);
        const isSelected = selected === time;
        return (
          <button
            key={time}
            disabled={!available}
            onClick={() => onPick(time)}
            className={cn(
              "min-h-11 rounded-lg border px-2 py-2.5 text-sm transition",
              !available && "cursor-not-allowed bg-muted/50 text-muted-foreground line-through",
              available && !isSelected && "hover:border-primary",
              isSelected && "bg-primary text-primary-foreground border-primary"
            )}
          >
            {time} {isPeak && <span className="text-accent">★</span>}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Phones only: the picked hour, the total and Continue, pinned to the bottom of the screen.
 * `data-mobile-cta` lets the portal layout pad its bottom so the bar never covers the footer.
 */
function MobileContinueBar({ time, total, onContinue }: { time: string; total: number; onContinue: () => void }) {
  return (
    <div
      data-mobile-cta
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-card px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.15)] lg:hidden"
    >
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-xs text-muted-foreground">{time} · total</p>
          <p className="text-lg font-bold">৳{total.toLocaleString()}</p>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-bold text-accent-foreground hover:opacity-90"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
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

/** "1 hr slot", "2 hr slot", "1 hr 30 min slot". */
const slotLabel = (minutes: number) => (minutes === 90 ? "1 hr 30 min slot" : `${minutes / 60} hr slot`);
