"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useBlockSlot, type Slot } from "@/hooks/useSlots";
import { toApiFailure } from "@/lib/api-error";
import { BLOCK_REASON_LABEL, slotTimeLabel } from "@/lib/slot-format";
import { BLOCK_REASONS, type BlockReason } from "@/types/slot";

/** Toast after a single-slot block; says so when the booking on it was cancelled and refunded. */
export function blockedToast(reason: BlockReason, cancelledBooking: boolean, bookingNumber?: string) {
  const what = `Slot blocked (${BLOCK_REASON_LABEL[reason]})`;
  if (!cancelledBooking) return toast.success(what);
  toast.success(what, {
    description: `Booking ${bookingNumber ? `#${bookingNumber} ` : ""}was cancelled and fully refunded.`,
  });
}

/**
 * Blocking a booked slot: pick a reason and confirm that the booking is cancelled with a full refund.
 * Same look as ConfirmDialog, with form fields (ConfirmDialog's description is a <p>, so it can't hold them).
 */
export function BlockBookedSlotDialog({ slot, onClose }: { slot: Slot | null; onClose: () => void }) {
  const block = useBlockSlot();
  const [reason, setReason] = useState<BlockReason>("maintenance");
  const [cancelBooking, setCancelBooking] = useState(false);

  function close() {
    setReason("maintenance");
    setCancelBooking(false);
    onClose();
  }

  function run() {
    if (!slot) return;
    const bookingNumber = slot.booking?.bookingNumber;
    block.mutate(
      { id: slot.id, reason, cancelBooking: true },
      {
        onSuccess: (res) => { blockedToast(reason, res.cancelledBooking, bookingNumber); close(); },
        onError: (err) => toast.error(toApiFailure(err).error),
      },
    );
  }

  return (
    <Dialog open={!!slot} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Block a booked slot?</DialogTitle>
          <DialogDescription>
            {slot ? `${slot.groundName} · ${slotTimeLabel(slot)}` : ""} becomes unavailable to customers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as BlockReason)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BLOCK_REASONS.map((r) => <SelectItem key={r} value={r}>{BLOCK_REASON_LABEL[r]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={cancelBooking} onCheckedChange={(v) => setCancelBooking(v === true)} className="mt-0.5" />
            <span>
              Cancel and refund the booking
              {slot?.booking && (
                <span className="text-muted-foreground"> (#{slot.booking.bookingNumber}, {slot.booking.customerName})</span>
              )}
            </span>
          </label>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>Cancel</Button>
          <Button type="button" variant="destructive" disabled={!cancelBooking || block.isPending} onClick={run}>
            {block.isPending ? "Blocking…" : "Block slot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
