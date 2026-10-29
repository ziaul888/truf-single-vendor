"use client";

import { useForm, Controller, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useCancelBooking } from "@/hooks/useBookings";
import { toApiFailure } from "@/lib/api-error";
import { formatSlotDate, slotPriceLabel, slotTimeLabel } from "@/lib/slot-format";
import type { Booking } from "@/types/booking";
import { XCircle } from "lucide-react";
import { toast } from "sonner";

const CancelSchema = z.object({
  reason: z.string().trim().max(500, "Keep the reason under 500 characters"),
  refund: z.boolean(),
  notifyCustomer: z.boolean(),
});
type CancelForm = z.infer<typeof CancelSchema>;

interface CancelDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** "decline" is the review-queue wording for cancelling a pending request. */
  mode?: "cancel" | "decline";
}

/** Cancel (or decline) a booking: frees the slot, optionally refunds what was paid and emails the customer. */
export function CancelDialog({ booking, open, onOpenChange, mode = "cancel" }: CancelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {booking && <CancelForm key={booking.id} booking={booking} mode={mode} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function CancelForm({ booking, mode, onClose }: { booking: Booking; mode: "cancel" | "decline"; onClose: () => void }) {
  const cancel = useCancelBooking();
  const hasPaid = booking.paid > 0;
  const verb = mode === "decline" ? "Decline" : "Cancel";
  const form = useForm<CancelForm>({
    resolver: zodResolver(CancelSchema),
    // Cancellation means a full refund of what was paid, so refund is on by default.
    defaultValues: { reason: "", refund: hasPaid, notifyCustomer: true },
  });
  const { control, register, handleSubmit, formState: { errors } } = form;

  function onSubmit(values: CancelForm) {
    cancel.mutate(
      { id: booking.id, refund: hasPaid && values.refund, reason: values.reason || undefined, notifyCustomer: values.notifyCustomer },
      {
        onSuccess: () => {
          const refunded = hasPaid && values.refund ? " with refund" : "";
          toast.success(`Booking ${booking.bookingNumber} ${mode === "decline" ? "declined" : "cancelled"}${refunded}`);
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
          <XCircle className="h-5 w-5 text-destructive" />{verb} Booking
        </DialogTitle>
        <DialogDescription>
          {verb} booking <span className="font-mono font-medium">{booking.bookingNumber}</span> for{" "}
          <span className="font-medium">{booking.contact.name}</span>? The slot becomes available again.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 py-3">
        <div className="space-y-1 rounded-md border p-3 text-sm">
          <SummaryRow label="Ground" value={booking.ground.name} />
          <SummaryRow label="Date & Time" value={`${formatSlotDate(booking.slot.date)} ${slotTimeLabel(booking.slot)}`} />
          <SummaryRow label="Total" value={slotPriceLabel(booking.total)} />
          <SummaryRow label="Paid" value={slotPriceLabel(booking.paid)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cancel-reason" className="text-sm font-medium">
            Reason <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea id="cancel-reason" rows={3} className="resize-none text-sm"
            placeholder="e.g. Ground maintenance scheduled, customer asked to cancel…" {...register("reason")} />
          {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
        </div>

        <Separator />

        <CheckRow control={control} name="refund" disabled={!hasPaid} title="Issue full refund"
          hint={hasPaid
            ? `Refund ${slotPriceLabel(booking.paid)}. Card payments go back through Stripe; cash or bank transfers are marked refunded, so pay them back by hand.`
            : "No payment on record"} />
        <CheckRow control={control} name="notifyCustomer" title="Notify customer via email"
          hint="Send a cancellation email with the reason" />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {mode === "decline" ? "Keep Pending" : "Keep Booking"}
        </Button>
        <Button type="submit" variant="destructive" disabled={cancel.isPending}>
          {cancel.isPending ? `${verb === "Cancel" ? "Cancelling" : "Declining"}…` : `${verb} Booking`}
        </Button>
      </DialogFooter>
    </form>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function CheckRow({ control, name, title, hint, disabled }: {
  control: Control<CancelForm>;
  name: "refund" | "notifyCustomer";
  title: string;
  hint: string;
  disabled?: boolean;
}) {
  const id = `cancel-${name}`;
  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <Controller control={control} name={name} render={({ field }) => (
        <Checkbox id={id} className="mt-0.5" checked={!disabled && field.value} disabled={disabled}
          onCheckedChange={(v) => field.onChange(Boolean(v))} />
      )} />
      <div>
        <Label htmlFor={id} className="cursor-pointer font-medium">{title}</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
