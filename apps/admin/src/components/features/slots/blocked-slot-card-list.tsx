"use client";

import { Button } from "@/components/ui/button";
import type { Slot } from "@/hooks/useSlots";
import { BLOCK_REASON_LABEL, durationLabel, formatSlotDate, slotPriceLabel, slotTimeLabel } from "@/lib/slot-format";
import { Ban, Unlock } from "lucide-react";

interface BlockedSlotCardListProps {
  slots: Slot[];
  /** Venue today: slots before it can't be unblocked. */
  today: string;
  showGround: boolean;
  busy: boolean;
  onUnblock: (id: string) => void;
}

/** The blocked slots table as stacked cards for phones, with a full-size Unblock. */
export function BlockedSlotCardList({ slots, today, showGround, busy, onUnblock }: BlockedSlotCardListProps) {
  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <Ban className="h-8 w-8 opacity-30" />
        <p className="text-sm">No blocked slots found.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {slots.map((slot) => (
        <li key={slot.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0 text-sm opacity-80">
            <p className="font-medium">{formatSlotDate(slot.date)} · {slotTimeLabel(slot)}</p>
            <p className="truncate text-xs text-muted-foreground">
              {slot.block ? BLOCK_REASON_LABEL[slot.block.reason] : "—"}
              {showGround && <> · {slot.groundName}</>} · {durationLabel(slot.durationMinutes)} · {slotPriceLabel(slot.price)}
            </p>
            {slot.block?.note && <p className="truncate text-xs text-muted-foreground">{slot.block.note}</p>}
          </div>
          <Button
            variant="outline"
            className="h-10 shrink-0 gap-1.5 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
            disabled={busy || slot.date < today}
            title={slot.date < today ? "Past slots can't be unblocked" : undefined}
            onClick={() => onUnblock(slot.id)}
          >
            <Unlock className="h-4 w-4" /> Unblock
          </Button>
        </li>
      ))}
    </ul>
  );
}
