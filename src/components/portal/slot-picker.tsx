"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ground } from "@/types/api";

const SERVICE_FEE = 50;

export function SlotPicker({ ground }: { ground: Ground }) {
  const router = useRouter();
  const dates = useMemo(() => buildDates(5), []);
  const [activeDate, setActiveDate] = useState(dates[0].iso);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const hours = useMemo(() => buildHours(ground), [ground]);
  const slotPrice = selectedHour != null ? priceForHour(ground, selectedHour) : null;
  const total = slotPrice != null ? slotPrice + SERVICE_FEE : null;

  function handleContinue() {
    if (selectedHour == null) return;
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
          Peak ★ slots ৳{ground.peakRate.toLocaleString()}/hr · {pad(ground.peakStartHour!)}:00–{pad(ground.peakEndHour!)}:00
        </p>
      )}

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Select date
      </p>
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-2 px-1">
        {dates.map((d) => (
          <button
            key={d.iso}
            onClick={() => { setActiveDate(d.iso); setSelectedHour(null); }}
            className={cn(
              "min-w-[64px] rounded-xl border p-2.5 text-center text-xs",
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
      <div className="grid grid-cols-3 gap-2">
        {hours.map(({ hour, available, isPeak }) => {
          const selected = selectedHour === hour;
          return (
            <button
              key={hour}
              disabled={!available}
              onClick={() => setSelectedHour(hour)}
              className={cn(
                "rounded-lg border px-2 py-2.5 text-sm transition",
                !available && "cursor-not-allowed bg-muted/50 text-muted-foreground line-through",
                available && !selected && "hover:border-primary",
                selected && "bg-primary text-primary-foreground border-primary"
              )}
            >
              {pad(hour)}:00 {isPeak && <span className="text-accent">★</span>}
            </button>
          );
        })}
      </div>

      {total != null && (
        <div className="mt-5 space-y-1.5 border-t pt-4 text-sm">
          <Row label={`1 hr × ৳${slotPrice!.toLocaleString()}`} value={`৳${slotPrice!.toLocaleString()}`} />
          <Row label="Service fee" value={`৳${SERVICE_FEE}`} />
          <Row label="Total" value={`৳${total.toLocaleString()}`} bold />
        </div>
      )}

      <button
        disabled={selectedHour == null}
        onClick={handleContinue}
        className={cn(
          "mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold",
          selectedHour == null
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

function buildDates(count: number) {
  const dows = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const mons = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().slice(0, 10),
      dow: dows[d.getDay()],
      day: pad(d.getDate()),
      mon: mons[d.getMonth()],
    };
  });
}

function buildHours(ground: Ground) {
  const out: { hour: number; available: boolean; isPeak: boolean }[] = [];
  for (let h = ground.openHour; h < ground.closeHour; h++) {
    const isPeak =
      ground.peakStartHour != null &&
      ground.peakEndHour != null &&
      h >= ground.peakStartHour &&
      h < ground.peakEndHour;
    // Stub availability — backend will return real availability per slot
    const available = h % 4 !== 2;
    out.push({ hour: h, available, isPeak });
  }
  return out;
}

function priceForHour(ground: Ground, h: number): number {
  const isPeak =
    ground.peakStartHour != null &&
    ground.peakEndHour != null &&
    ground.peakRate != null &&
    h >= ground.peakStartHour &&
    h < ground.peakEndHour;
  return isPeak ? ground.peakRate! : ground.hourlyRate;
}

const pad = (n: number) => n.toString().padStart(2, "0");
