"use client";

import { cn } from "@/lib/utils";
import type { TimeSlot } from "@/hooks/useAddBooking";
import { MAX_SLOTS_PER_BOOKING } from "@/lib/slot-format";
import { Check } from "lucide-react";

interface SlotPickerProps {
  slots: TimeSlot[];
  /** The picked slot ids (one ground and date). */
  value: string[];
  onChange: (slotIds: string[]) => void;
  /** Most slots one booking can hold. */
  max?: number;
  loading?: boolean;
  error?: string;
}

export function SlotPicker({ slots, value, onChange, max = MAX_SLOTS_PER_BOOKING, loading, error }: SlotPickerProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-[62px] animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return <p className="text-sm text-muted-foreground">No open slots on this date. Try another date or ground.</p>;
  }

  // A picked slot that someone else took drops out of `slots` on refetch; it must not use up the limit.
  const live = value.filter((id) => slots.some((s) => s.id === id));
  const atLimit = live.length >= max;
  const toggle = (id: string) => onChange(live.includes(id) ? live.filter((v) => v !== id) : [...live, id]);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {slots.map((slot) => {
          const isTaken = slot.status === "taken";
          const isSelected = value.includes(slot.id);
          // At the limit only the picked slots stay tappable (to take one off).
          const isLimited = atLimit && !isSelected && !isTaken;
          return (
            <button
              key={slot.id}
              type="button"
              disabled={isTaken || isLimited}
              aria-pressed={isSelected}
              onClick={() => toggle(slot.id)}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl border-2 px-2 py-3 text-center transition-all",
                isTaken && "cursor-not-allowed bg-muted/60 opacity-60",
                isLimited && "cursor-not-allowed opacity-50",
                isSelected && "border-primary bg-primary text-primary-foreground shadow-md",
                !isTaken && !isLimited && !isSelected && "border-border cursor-pointer hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              {isSelected && (
                <Check className="absolute right-1.5 top-1.5 h-3 w-3" />
              )}
              <span className={cn("text-[13px] font-semibold leading-none", isSelected && "text-primary-foreground")}>
                {slot.startTime}
              </span>
              <span className={cn("mt-1 text-[10px] leading-none", isSelected ? "text-primary-foreground/75" : "text-muted-foreground")}>
                – {slot.endTime}
              </span>
              {isTaken && (
                <span className="absolute -right-1 -top-1 rounded-full bg-destructive px-1.5 py-px text-[9px] font-bold text-white leading-none shadow-sm">
                  Taken
                </span>
              )}
            </button>
          );
        })}
      </div>
      {atLimit && <p role="status" className="text-xs text-muted-foreground">Up to {max} slots per booking</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
