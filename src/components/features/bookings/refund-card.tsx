"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useMarkRefundSent } from "@/hooks/useBookings";
import { toApiFailure } from "@/lib/api-error";
import { formatEventTime, slotPriceLabel } from "@/lib/slot-format";
import type { BookingDetail, BookingRefund } from "@/types/booking";
import { PAYMENT_METHOD_LABEL } from "./booking-status-helpers";
import { keepKeyboardClosed } from "./keep-keyboard-closed";

const RefundSentSchema = z.object({
  note: z.string().trim().max(200, "Keep the note under 200 characters"),
});
type RefundSentForm = z.infer<typeof RefundSentSchema>;

/** Where the money goes: "bKash 01XXXXXXXXX". */
const refundTarget = (r: BookingRefund) =>
  `${PAYMENT_METHOD_LABEL[r.method]}${r.payerNumber ? ` ${r.payerNumber}` : ""}`;

/**
 * A cancelled booking whose bKash / Nagad money has to go back by hand. The system marks the payment
 * refunded but never sends the money, so staff pay it from their own app and record it here.
 */
export function RefundCard({ booking }: { booking: BookingDetail }) {
  const [open, setOpen] = useState(false);
  const { refund } = booking;
  if (!refund) return null;

  if (refund.sentAt) {
    return (
      <div role="status" className="rounded-xl border bg-card p-4 text-sm">
        <p className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
          Refund sent {slotPriceLabel(refund.amount)}
        </p>
        <p className="mt-1 break-words text-muted-foreground">
          To {refundTarget(refund)} on {formatEventTime(refund.sentAt)}{refund.sentBy ? ` by ${refund.sentBy}` : ""}.
        </p>
        {refund.note && <p className="mt-1 break-words italic text-muted-foreground">{refund.note}</p>}
      </div>
    );
  }

  return (
    <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
      <p className="flex items-start gap-2 text-base font-semibold">
        <Undo2 className="mt-1 h-4 w-4 shrink-0" />
        <span className="min-w-0 break-words">Refund due {slotPriceLabel(refund.amount)} → {refundTarget(refund)}</span>
      </p>
      <p className="mt-1 text-xs opacity-90">
        Send this back from your own {PAYMENT_METHOD_LABEL[refund.method]} app. The system does not send it for you.
      </p>
      <Button type="button" className="mt-3 h-11 w-full sm:w-auto" onClick={() => setOpen(true)}>
        Mark refund sent
      </Button>
      <RefundSentDialog booking={booking} refund={refund} open={open} onOpenChange={setOpen} />
    </div>
  );
}

function RefundSentDialog({ booking, refund, open, onOpenChange }: {
  booking: BookingDetail;
  refund: BookingRefund;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={keepKeyboardClosed}>
        <RefundSentFormBody booking={booking} refund={refund} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function RefundSentFormBody({ booking, refund, onClose }: { booking: BookingDetail; refund: BookingRefund; onClose: () => void }) {
  const qc = useQueryClient();
  const markSent = useMarkRefundSent();
  const { register, handleSubmit, formState: { errors } } = useForm<RefundSentForm>({
    resolver: zodResolver(RefundSentSchema),
    defaultValues: { note: "" },
  });

  function onSubmit(values: RefundSentForm) {
    markSent.mutate(
      { id: booking.id, note: values.note || undefined },
      {
        onSuccess: () => {
          toast.success(`Refund recorded for ${booking.bookingNumber}`);
          onClose();
        },
        onError: (err) => {
          const failure = toApiFailure(err);
          if (failure.code === "NO_REFUND_DUE") {
            // Someone else already recorded it: refresh so the card shows "Refund sent".
            toast.info("This refund was already marked as sent.");
            qc.invalidateQueries({ queryKey: ["bookings"] });
            qc.invalidateQueries({ queryKey: ["dashboard"] });
            onClose();
            return;
          }
          toast.error(failure.error);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>Mark refund sent</DialogTitle>
        <DialogDescription>
          Confirm you sent {slotPriceLabel(refund.amount)} to {refundTarget(refund)} for booking{" "}
          <span className="font-mono font-medium">{booking.bookingNumber}</span>. The system does not move this money.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-1.5 py-3">
        <Label htmlFor="refund-note" className="text-sm font-medium">
          Note <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea id="refund-note" rows={3} maxLength={200} className="resize-none"
          placeholder="e.g. TrxID of the refund" {...register("note")} />
        {errors.note && <p className="text-xs text-destructive">{errors.note.message}</p>}
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" className="h-11" onClick={onClose} disabled={markSent.isPending}>Cancel</Button>
        <Button type="submit" className="h-11" disabled={markSent.isPending}>
          {markSent.isPending ? "Saving…" : "Mark refund sent"}
        </Button>
      </DialogFooter>
    </form>
  );
}
