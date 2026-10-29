"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Ban, Eye, History, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBlockSlot, useUnblockSlot, type Slot } from "@/hooks/useSlots";
import { toApiFailure } from "@/lib/api-error";
import { BLOCK_REASON_LABEL, slotTimeLabel } from "@/lib/slot-format";
import { BLOCK_REASONS, type BlockReason } from "@/types/slot";
import { blockedToast } from "./block-booked-slot-dialog";

const BLOCK_BTN = "h-7 px-2 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20";

interface Props {
  slot: Slot;
  onHistory: (slot: Slot) => void;
  /** Booked slots ask first: blocking cancels and refunds the booking. */
  onBlockBooked: (slot: Slot) => void;
}

/**
 * History, View booking, Block and Unblock for one slot row.
 * Free slots block straight away; booked ones go through a confirm; held ones (customer paying) can't be blocked.
 */
export function SlotRowActions({ slot, onHistory, onBlockBooked }: Props) {
  const block = useBlockSlot();
  const unblock = useUnblockSlot();
  const busy = block.isPending || unblock.isPending;

  function handleBlock(reason: BlockReason) {
    block.mutate(
      { id: slot.id, reason },
      {
        onSuccess: (res) => blockedToast(reason, res.cancelledBooking),
        onError: (err) => toast.error(toApiFailure(err).error),
      },
    );
  }

  function handleUnblock() {
    unblock.mutate(slot.id, {
      onSuccess: () => toast.success("Slot unblocked"),
      onError: (err) => toast.error(toApiFailure(err).error),
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1"
        onClick={() => onHistory(slot)}
        aria-label={`History of ${slotTimeLabel(slot)}`}
      >
        <History className="h-3 w-3" /> History
      </Button>
      {slot.booking && (
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" asChild>
          <Link href={`/dashboard/bookings/${slot.booking.id}`}><Eye className="h-3 w-3" /> View</Link>
        </Button>
      )}
      {slot.status === "available" && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className={BLOCK_BTN} disabled={busy}>
              <Ban className="h-3 w-3" /> Block
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs">Reason</DropdownMenuLabel>
            {BLOCK_REASONS.map((r) => (
              <DropdownMenuItem key={r} onSelect={() => handleBlock(r)}>{BLOCK_REASON_LABEL[r]}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {slot.status === "booked" && (
        <Button variant="ghost" size="sm" className={BLOCK_BTN} onClick={() => onBlockBooked(slot)}>
          <Ban className="h-3 w-3" /> Block
        </Button>
      )}
      {slot.status === "blocked" && (
        <Button
          variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
          disabled={busy}
          onClick={handleUnblock}
        >
          <Unlock className="h-3 w-3" /> Unblock
        </Button>
      )}
    </div>
  );
}
