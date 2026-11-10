"use client";

import Link from "next/link";
import type { Slot } from "@/hooks/useSlots";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { BLOCK_REASON_LABEL, durationLabel, slotPriceLabel, slotTimeLabel } from "@/lib/slot-format";
import type { SlotStatus } from "@/types/slot";
import { SlotRowActions } from "./slot-row-actions";

export const STATUS_CLS: Record<SlotStatus, string> = {
  available: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  held:      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  booked:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  blocked:   "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300",
};

/** "18:05" in the venue's timezone. */
const venueClock = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

/** Held and booked slots belong to a customer, so they can't be selected for bulk actions. */
export const isSelectable = (s: Slot) => s.status === "available" || s.status === "blocked";

/** The slot's status pill, with the block reason on hover. */
export function SlotStatusPill({ slot }: { slot: Slot }) {
  return (
    <span
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", STATUS_CLS[slot.status])}
      title={slot.block ? `${BLOCK_REASON_LABEL[slot.block.reason]}${slot.block.note ? `: ${slot.block.note}` : ""}` : undefined}
    >
      {slot.status}
    </span>
  );
}

/** The customer cell: who booked it, or "Customer paying…" while a slot is held in checkout. */
export function SlotCustomer({ slot }: { slot: Slot }) {
  if (slot.status === "held") {
    return (
      <span className="text-amber-700 dark:text-amber-400">
        {slot.booking?.customerName && <span className="block text-foreground">{slot.booking.customerName}</span>}
        <span className="text-xs">Customer paying…{slot.heldUntil ? ` (until ${venueClock(slot.heldUntil)})` : ""}</span>
      </span>
    );
  }
  return slot.booking?.customerName ? <>{slot.booking.customerName}</> : <span className="text-muted-foreground">—</span>;
}

interface SlotCardListProps {
  slots: Slot[];
  selected: Set<string>;
  /** Show each slot's ground: only when the list can span more than one. */
  showGround: boolean;
  onToggle: (id: string, on: boolean) => void;
  onHistory: (slot: Slot) => void;
  onBlockBooked: (slot: Slot) => void;
}

/** The slots table as stacked cards for phones, where Block / Unblock would sit off-screen. */
export function SlotCardList({ slots, selected, showGround, onToggle, onHistory, onBlockBooked }: SlotCardListProps) {
  if (slots.length === 0) return <p className="py-12 text-center text-sm text-muted-foreground">No slots found for this filter.</p>;

  return (
    <ul className="divide-y">
      {slots.map((slot) => (
        <li key={slot.id} className={cn("space-y-2 px-4 py-3", slot.status === "blocked" && "opacity-60", selected.has(slot.id) && "bg-muted/50")}>
          <div className="flex items-start gap-1">
            {/* The label is the tap target, so the 20px box is easy to hit */}
            <label className="-m-2 flex shrink-0 cursor-pointer p-2.5">
              <Checkbox
                aria-label={`Select ${slotTimeLabel(slot)}`}
                checked={selected.has(slot.id)}
                disabled={!isSelectable(slot)}
                onCheckedChange={(v) => onToggle(slot.id, v === true)}
              />
            </label>
            <div className="min-w-0 flex-1 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{slotTimeLabel(slot)}</span>
                <SlotStatusPill slot={slot} />
              </div>
              <p className="text-xs text-muted-foreground">
                {showGround && <>{slot.groundName} · </>}{durationLabel(slot.durationMinutes)} · {slotPriceLabel(slot.price)}
                {slot.booking && <> · <Link href={`/dashboard/bookings/${slot.booking.id}`} className="font-mono text-primary hover:underline">#{slot.booking.bookingNumber}</Link></>}
              </p>
              {(slot.booking?.customerName || slot.status === "held") && <div className="mt-0.5"><SlotCustomer slot={slot} /></div>}
            </div>
          </div>
          <SlotRowActions slot={slot} onHistory={onHistory} onBlockBooked={onBlockBooked} large />
        </li>
      ))}
    </ul>
  );
}
