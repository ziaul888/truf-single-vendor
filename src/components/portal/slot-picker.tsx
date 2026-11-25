"use client";

import { turfPortalPath, turfPortalApiPrefix } from "@/lib/turf-portal-path";
import { useTurfPortal } from "@/components/portal/turf-portal-scope";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, CalendarX2, Clock, RotateCw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ground } from "@/types/api";
import type { PublicClosure, PublicSlot } from "@/types/slot";
import { formatPeakRanges } from "@/lib/ground-format";
import {
  addDays, formatSlotsParam, slotClockLabel, slotCountLabel, slotStartTime, venueToday,
} from "@/lib/slot-format";
import { SkeletonBlock } from "@/components/portal/loading/skeleton-block";
import { takaLabel } from "@/components/portal/checkout/checkout-totals";
import { useCheckoutOptions } from "@/hooks/useCheckoutOptions";
import { bookingSlotLimit } from "@/lib/booking-limits";

/** Days offered in the picker; turf-api returns at most 14 per request. */
const DAYS_SHOWN = 7;
const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const fullDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric",
});

/** Real availability and prices from turf-api for the picker's whole date strip. */
function usePublicSlots(groundId: string, from: string, to: string, slug?: string) {
  return useQuery<PublicSlot[]>({
    queryKey: ["public-slots", slug ?? null, groundId, from, to],
    queryFn: async () => {
      const res = await fetch(`/api/v1${turfPortalApiPrefix(slug)}/grounds/${groundId}/slots?from=${from}&to=${to}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error("Could not load slots");
      return json.data;
    },
    staleTime: 30_000,
  });
}

/** Venue closures overlapping the picker's dates, so a closed day can say why ("Closed for Eid"). */
function usePublicClosures(groundId: string, from: string, to: string, slug?: string) {
  return useQuery<PublicClosure[]>({
    queryKey: ["public-closures", slug ?? null, groundId, from, to],
    queryFn: async () => {
      const res = await fetch(`/api/v1${turfPortalApiPrefix(slug)}${slug ? `/grounds/${groundId}` : ""}/closures?from=${from}&to=${to}`);
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
  const portal = useTurfPortal();
  const router = useRouter();
  const timesHeading = useRef<HTMLHeadingElement>(null);
  const dates = useMemo(() => buildDates(DAYS_SHOWN, portal?.timezone), [portal?.timezone]);
  const [activeDate, setActiveDate] = useState(
    dates.find((d) => d.iso === initialDate)?.iso ?? dates[0].iso,
  );
  /** The picked slots' starts, "16:30" (90-minute slots start on half hours): one date, up to the limit. */
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  const { data: allSlots, isLoading, isError, isFetching, refetch } = usePublicSlots(ground.id, dates[0].iso, dates[dates.length - 1].iso, portal?.slug);
  const daySlots = (allSlots ?? []).filter((s) => s.date === activeDate);
  const hasAvailability = daySlots.some((slot) => slot.available);
  const nextAvailableDate = hasAvailability ? undefined : dates.find(({ iso }) =>
    iso > activeDate && allSlots?.some((slot) => slot.date === iso && slot.available),
  );
  const { data: closures } = usePublicClosures(ground.id, dates[0].iso, dates[dates.length - 1].iso, portal?.slug);
  const closure = closureFor(closures ?? [], ground.id, activeDate);
  const { data: options } = useCheckoutOptions();
  const maxSlots = bookingSlotLimit(options);
  // Only slots that are still free count (a refresh can take one away), earliest first.
  const selected = daySlots
    .filter((s) => s.available && selectedTimes.includes(slotStartTime(s)))
    .sort((a, b) => slotStartTime(a).localeCompare(slotStartTime(b)));
  const subtotal = selected.reduce((sum, s) => sum + s.price, 0);
  // The fee comes from turf-api; until it is loaded the total is only a subtotal.
  const serviceFee = options?.serviceFee ?? null;
  const atLimit = selected.length >= maxSlots;
  const peakHours = formatPeakRanges(ground.peakRanges ?? []);

  function pickDate(iso: string) {
    if (iso === activeDate) return;
    setActiveDate(iso);
    setSelectedTimes([]);
  }

  function toggleTime(time: string) {
    // Built from `selected` (still-free slots), so a slot a refresh took away can't use up the limit.
    const current = selected.map(slotStartTime);
    setSelectedTimes(
      current.includes(time) ? current.filter((t) => t !== time) : current.length < maxSlots ? [...current, time] : current,
    );
  }

  function handleContinue() {
    if (selected.length === 0 || selected.length > maxSlots) return;
    const params = new URLSearchParams({
      groundId: ground.id,
      date: activeDate,
      slots: formatSlotsParam(selected.map(slotStartTime), maxSlots),
    });
    router.push(turfPortalPath(portal?.slug, `/checkout?${params.toString()}`));
  }

  return (
    <div className="@container min-w-0 rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b bg-muted/40 px-4 py-4 @sm:px-5">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{ground.peakRate ? "Off-peak rate" : "Hourly rate"}</p>
          <p className="mt-0.5 text-2xl font-extrabold tracking-tight tabular-nums">
            ৳{ground.hourlyRate.toLocaleString()} <span className="text-sm font-normal tracking-normal text-muted-foreground">/ hour</span>
          </p>
        </div>
        {ground.peakRate && (
          <div className="flex items-start gap-2 rounded-xl border bg-card px-3 py-2 text-xs">
            <Zap className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <div>
              <p className="font-semibold">Peak rate · ৳{ground.peakRate.toLocaleString()}/hr</p>
              {peakHours && <p className="mt-0.5 text-muted-foreground tabular-nums">{peakHours}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-5 px-4 py-5 @sm:px-5">
        <fieldset className="min-w-0">
          <legend className="mb-2.5 text-sm font-semibold">
            <CalendarDays className="mr-2 inline size-4 align-text-bottom text-primary" aria-hidden />
            Choose a date
          </legend>
          <DateStrip dates={dates} active={activeDate} onPick={pickDate} />
        </fieldset>

        <section aria-label="Choose a time">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
            <h3 ref={timesHeading} tabIndex={-1} className="font-semibold">
              <Clock className="mr-2 inline size-4 align-text-bottom text-primary" aria-hidden />
              Choose a time
            </h3>
            {!isLoading && !isError && hasAvailability && (
              <p aria-live="polite" className="text-xs text-muted-foreground">
                {selected.length > 0 ? `${selected.length} of ${maxSlots} selected` : `Choose up to ${slotCountLabel(maxSlots)}`}
              </p>
            )}
          </div>
          {isLoading ? (
            <div role="status" className="grid grid-cols-2 gap-2 @sm:grid-cols-3 @xl:grid-cols-4">
              <span className="sr-only">Loading booking times</span>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-16" />)}
            </div>
          ) : isError ? (
            <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm">
              <p role="alert" className="font-medium">Couldn’t load booking times.</p>
              <button type="button" onClick={() => refetch()} disabled={isFetching} className={cn("inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-primary hover:underline disabled:opacity-60", FOCUS_RING)}>
                <RotateCw className="size-3.5" aria-hidden /> {isFetching ? "Retrying…" : "Try again"}
              </button>
            </div>
          ) : !hasAvailability ? (
            <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3.5 text-sm">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-card text-muted-foreground">
                <CalendarX2 className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <div role="status">
                  <p className="font-semibold">{closure?.label || "No times available for online booking"}</p>
                  <p className="mt-1 text-muted-foreground">Choose another date to check availability.</p>
                </div>
                {nextAvailableDate && (
                  <button
                    type="button"
                    onClick={() => {
                      pickDate(nextAvailableDate.iso);
                      timesHeading.current?.focus();
                    }}
                    className={cn("mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-semibold text-primary hover:underline", FOCUS_RING)}
                  >
                    See {nextAvailableDate.dow}, {nextAvailableDate.day} {nextAvailableDate.mon} <ArrowRight className="size-3.5 shrink-0" aria-hidden />
                  </button>
                )}
              </div>
            </div>
          ) : null}
          {!isLoading && !isError && daySlots.length > 0 && (
            <div className={cn(!hasAvailability && "mt-3")}>
              <HourGrid slots={daySlots} selected={selectedTimes} atLimit={atLimit} onPick={toggleTime} />
            </div>
          )}
          {selected.length > maxSlots && (
            <p role="alert" className="mt-2 text-xs text-destructive">The booking limit changed. Remove slots to continue.</p>
          )}
        </section>
      </div>

      {!isError && hasAvailability && (
        <div className="space-y-3 rounded-b-2xl border-t bg-muted/25 px-4 py-4 @sm:px-5">
          {selected.length > 0 && (
            <div className="space-y-1.5 text-sm">
              {selected.map((slot) => <Row key={slotStartTime(slot)} label={slotClockLabel(slot)} value={takaLabel(slot.price)} />)}
              <Row label="Subtotal" value={takaLabel(subtotal)} />
              {serviceFee != null ? (
                <>
                  <Row label="Service fee" value={takaLabel(serviceFee)} />
                  <Row label="Total" value={takaLabel(subtotal + serviceFee)} bold />
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Service fee added at checkout.</p>
              )}
            </div>
          )}
          <button
            type="button"
            data-football-kick
            disabled={selected.length === 0 || selected.length > maxSlots}
            onClick={handleContinue}
            className={cn(
              "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
              selected.length > 0 && "max-lg:hidden",
              FOCUS_RING,
            )}
          >
            Continue to payment <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      )}
      {!isError && selected.length > 0 && (
        <MobileContinueBar
          count={selected.length}
          amount={serviceFee != null ? subtotal + serviceFee : subtotal}
          isTotal={serviceFee != null}
          onContinue={handleContinue}
          disabled={selected.length > maxSlots}
        />
      )}
    </div>
  );
}

function DateStrip({
  dates, active, onPick,
}: {
  dates: ReturnType<typeof buildDates>; active: string; onPick: (iso: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 @sm:grid-cols-7 @sm:gap-1.5 @md:gap-2">
      {dates.map((date, index) => (
        <button
          key={date.iso}
          type="button"
          aria-pressed={active === date.iso}
          aria-label={index === 0 ? `Today, ${date.label}` : date.label}
          onClick={() => onPick(date.iso)}
          className={cn(
            "flex min-h-16 min-w-0 flex-col items-center justify-center rounded-xl border px-1 py-1.5 text-xs transition-colors",
            active === date.iso ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/60 hover:bg-primary/5",
            FOCUS_RING,
          )}
        >
          <span className={cn("font-medium", active !== date.iso && "text-muted-foreground")}>{index === 0 ? "Today" : date.dow}</span>
          <span className="text-lg font-extrabold leading-snug tabular-nums">{date.day}</span>
          <span className={cn(active !== date.iso && "text-muted-foreground")}>{date.mon}</span>
        </button>
      ))}
    </div>
  );
}

function HourGrid({
  slots, selected, atLimit, onPick,
}: {
  slots: PublicSlot[]; selected: string[]; atLimit: boolean; onPick: (time: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 @sm:grid-cols-3 @xl:grid-cols-4">
      {slots.map((slot) => {
        const { available, isPeak } = slot;
        const time = slotStartTime(slot);
        const isSelected = selected.includes(time);
        // At the limit only the picked slots stay tappable (to take one off).
        const limited = available && atLimit && !isSelected;
        return (
          <button
            key={time}
            type="button"
            data-football-kick
            aria-pressed={isSelected}
            disabled={!available || limited}
            onClick={() => onPick(time)}
            className={cn(
              "flex min-h-16 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border px-1.5 py-2 text-xs transition-colors",
              !available && "cursor-not-allowed bg-muted/50 text-muted-foreground",
              limited && "cursor-not-allowed opacity-50",
              available && !isSelected && !limited && "hover:border-primary/60 hover:bg-primary/5",
              isSelected && "border-primary bg-primary text-primary-foreground",
              FOCUS_RING,
            )}
          >
            <span className={cn("font-semibold tabular-nums @md:text-sm", !available && "line-through")}>{slotClockLabel(slot)}</span>
            <span className={cn("flex items-center gap-1 tabular-nums", !isSelected && "text-muted-foreground")}>
              {available && isPeak && (
                <><Zap className={cn("size-3 shrink-0", !isSelected && "text-primary")} aria-hidden /><span className="sr-only">Peak rate</span></>
              )}
              {available ? takaLabel(slot.price) : "Unavailable"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Phones only: how many slots, the amount and Continue, pinned to the bottom of the screen.
 * `data-mobile-cta` lets the portal layout pad its bottom so the bar never covers the footer.
 */
function MobileContinueBar({
  count, amount, isTotal, onContinue, disabled,
}: {
  count: number; amount: number; isTotal: boolean; onContinue: () => void; disabled: boolean;
}) {
  return (
    <div
      data-mobile-cta
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-card px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.15)] lg:hidden"
    >
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-xs text-muted-foreground">{slotCountLabel(count)} · {isTotal ? "total" : "subtotal"}</p>
          <p className="text-lg font-bold">{takaLabel(amount)}</p>
        </div>
        <button
          type="button"
          data-football-kick
          onClick={onContinue}
          disabled={disabled}
          className={cn("inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50", FOCUS_RING)}
        >
          Continue <ArrowRight className="size-4" aria-hidden />
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
function buildDates(count: number, timezone?: string) {
  const dows = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const mons = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const first = venueToday(0, timezone);
  return Array.from({ length: count }, (_, i) => {
    const iso = addDays(first, i);
    const d = new Date(`${iso}T00:00:00Z`);
    return { iso, dow: dows[d.getUTCDay()], day: pad(d.getUTCDate()), mon: mons[d.getUTCMonth()], label: fullDate.format(d) };
  });
}

const pad = (n: number) => n.toString().padStart(2, "0");
