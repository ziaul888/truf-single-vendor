"use client";

import { cn } from "@/lib/utils";
import type { TimeSlot } from "@/hooks/useAddBooking";
import { Check } from "lucide-react";

interface SlotPickerProps {
  slots: TimeSlot[];
  value: string;
  onChange: (slotId: string) => void;
  loading?: boolean;
  error?: string;
}

export function SlotPicker({ slots, value, onChange, loading, error }: SlotPickerProps) {
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
    return <p className="text-sm text-muted-foreground">No slots available for this ground.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {slots.map((slot) => {
          const isTaken = slot.status === "taken";
          const isSelected = slot.id === value;
          return (
            <button
              key={slot.id}
              type="button"
              disabled={isTaken}
              onClick={() => onChange(slot.id)}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl border-2 px-2 py-3 text-center transition-all",
                isTaken && "cursor-not-allowed bg-muted/60 opacity-60",
                isSelected && "border-primary bg-primary text-primary-foreground shadow-md",
                !isTaken && !isSelected && "border-border cursor-pointer hover:border-primary/50 hover:bg-primary/5"
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
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
