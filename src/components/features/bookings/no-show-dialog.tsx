"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/features/confirm-dialog";
import { useMarkNoShow, useUndoNoShow } from "@/hooks/useBookings";
import { toApiFailure } from "@/lib/api-error";
import { slotPriceLabel } from "@/lib/slot-format";
import { UserX } from "lucide-react";
import { toast } from "sonner";

const NoShowSchema = z.object({
  reason: z.string().trim().max(500, "Keep the reason under 500 characters"),
});
type NoShowForm = z.infer<typeof NoShowSchema>;

/** What the dialog needs: a full booking or a dashboard "Needs outcome" row. */
export interface NoShowTarget {
  id: string;
  bookingNumber: string;
  customerName: string;
  paid: number;
  due: number;
}

interface NoShowDialogProps {
  booking: NoShowTarget | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/** "Mark no-show": the team didn't turn up. What was paid stays; the rest of the due is written off. */
export function NoShowDialog({ booking, open, onOpenChange }: NoShowDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {booking && <NoShowFormBody key={booking.id} booking={booking} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function NoShowFormBody({ booking, onClose }: { booking: NoShowTarget; onClose: () => void }) {
  const markNoShow = useMarkNoShow();
  const { register, handleSubmit, formState: { errors } } = useForm<NoShowForm>({
    resolver: zodResolver(NoShowSchema),
    defaultValues: { reason: "" },
  });

  function onSubmit(values: NoShowForm) {
    markNoShow.mutate(
      { id: booking.id, reason: values.reason || undefined },
      {
        onSuccess: () => {
          toast.success(`Booking ${booking.bookingNumber} marked no-show`);
          onClose();
        },
        onError: (err) => toast.error(toApiFailure(err).error),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserX className="h-5 w-5 text-destructive" />Mark No-show
        </DialogTitle>
        <DialogDescription>
          Mark booking <span className="font-mono font-medium">{booking.bookingNumber}</span> for{" "}
          <span className="font-medium">{booking.customerName}</span> as a no-show? The slot stays booked and no email is sent.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 py-3">
        <p className="rounded-md border p-3 text-sm font-medium">
          {slotPriceLabel(booking.paid)} advance stays · {slotPriceLabel(booking.due)} due written off
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="no-show-reason" className="text-sm font-medium">
            Reason <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea id="no-show-reason" rows={3} className="resize-none text-sm"
            placeholder="e.g. Team didn't turn up, phone switched off…" {...register("reason")} />
          {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="destructive" disabled={markNoShow.isPending}>
          {markNoShow.isPending ? "Marking…" : "Confirm No-show"}
        </Button>
      </DialogFooter>
    </form>
  );
}

/** "Undo no-show": back to completed or confirmed, and the due comes back. */
export function UndoNoShowDialog({ booking, open, onOpenChange }: {
  booking: Pick<NoShowTarget, "id" | "bookingNumber">;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const undo = useUndoNoShow();

  function onConfirm() {
    if (undo.isPending) return;
    undo.mutate(booking.id, {
      onSuccess: () => {
        toast.success(`No-show undone for ${booking.bookingNumber}`);
        onOpenChange(false);
      },
      onError: (err) => toast.error(toApiFailure(err).error),
    });
  }

  return (
    <ConfirmDialog
      open={open}
      title="Undo no-show?"
      description={<>Booking <span className="font-mono">{booking.bookingNumber}</span> goes back to completed (or confirmed if the slot is still on), and any written-off due is owed again.</>}
      confirmLabel={undo.isPending ? "Undoing…" : "Undo No-show"}
      destructive={false}
      onConfirm={onConfirm}
      onCancel={() => onOpenChange(false)}
    />
  );
}

/** A full booking as a no-show target. */
export const noShowTargetOf = (b: { id: string; bookingNumber: string; contact: { name: string }; paid: number; due: number }): NoShowTarget => ({
  id: b.id, bookingNumber: b.bookingNumber, customerName: b.contact.name, paid: b.paid, due: b.due,
});
