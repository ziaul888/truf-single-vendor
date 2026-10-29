"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useConfirmBooking } from "@/hooks/useBookings";
import { toApiFailure } from "@/lib/api-error";
import { formatSlotDate, slotPriceLabel, slotTimeLabel } from "@/lib/slot-format";
import { OFFLINE_METHODS, type Booking } from "@/types/booking";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, paymentStatusVariant } from "./booking-status-helpers";
import { PayAtVenueBadge } from "./pay-at-venue-badge";

const ConfirmSchema = z.object({
  markPaid: z.boolean(),
  method: z.enum(OFFLINE_METHODS),
  notifyCustomer: z.boolean(),
});
type ConfirmForm = z.infer<typeof ConfirmSchema>;

interface ConfirmDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/** Confirms a pending staff or pay-at-venue booking, optionally recording the payment and emailing the customer. */
export function ConfirmDialog({ booking, open, onOpenChange }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {booking && <ConfirmForm key={booking.id} booking={booking} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function ConfirmForm({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const confirm = useConfirmBooking();
  const hasDue = booking.due > 0;
  const { control, watch, handleSubmit } = useForm<ConfirmForm>({
    resolver: zodResolver(ConfirmSchema),
    defaultValues: { markPaid: false, method: "cash", notifyCustomer: true },
  });
  const markPaid = watch("markPaid");

  function onSubmit(values: ConfirmForm) {
    const paid = hasDue && values.markPaid;
    confirm.mutate(
      { id: booking.id, markPaid: paid, method: paid ? values.method : undefined, notifyCustomer: values.notifyCustomer },
      {
        onSuccess: () => {
          toast.success(`Booking ${booking.bookingNumber} confirmed${paid ? " and payment recorded" : ""}${values.notifyCustomer ? " · customer emailed" : ""}`);
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
          <CheckCircle2 className="h-5 w-5 text-green-600" />Confirm Booking
        </DialogTitle>
        <DialogDescription>
          Confirm booking <span className="font-mono font-medium">{booking.bookingNumber}</span> for{" "}
          <span className="font-medium">{booking.contact.name}</span>?
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 py-3">
        <div className="space-y-1.5 rounded-md border bg-muted/30 p-3 text-sm">
          <Row label="Ground">{booking.ground.name}</Row>
          <Row label="Date & Time">{formatSlotDate(booking.slot.date)} {slotTimeLabel(booking.slot)}</Row>
          <Row label="Total">{slotPriceLabel(booking.total)}</Row>
          <Row label="Due">{slotPriceLabel(booking.due)}</Row>
          <Row label="Payment">
            <span className="flex items-center gap-1.5">
              {booking.payAtVenue && <PayAtVenueBadge />}
              <Badge variant={paymentStatusVariant(booking.paymentStatus)} className="text-xs">{PAYMENT_STATUS_LABEL[booking.paymentStatus]}</Badge>
            </span>
          </Row>
        </div>

        <Separator />

        <div className="space-y-2.5">
          <div className="space-y-3 rounded-md border p-3">
            <div className="flex items-start gap-3">
              <Controller control={control} name="markPaid" render={({ field }) => (
                <Checkbox id="markPaid" className="mt-0.5" checked={hasDue && field.value} disabled={!hasDue}
                  onCheckedChange={(v) => field.onChange(Boolean(v))} />
              )} />
              <div>
                <Label htmlFor="markPaid" className="cursor-pointer font-medium">Mark payment as received</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {hasDue ? `Record ${slotPriceLabel(booking.due)} collected in cash or by bank transfer` : "Nothing due on this booking"}
                </p>
              </div>
            </div>
            {hasDue && markPaid && (
              <Controller control={control} name="method" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OFFLINE_METHODS.map((m) => <SelectItem key={m} value={m}>{PAYMENT_METHOD_LABEL[m]}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            )}
          </div>
          <div className="flex items-start gap-3 rounded-md border p-3">
            <Controller control={control} name="notifyCustomer" render={({ field }) => (
              <Checkbox id="sendEmail" className="mt-0.5" checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
            )} />
            <div>
              <Label htmlFor="sendEmail" className="cursor-pointer font-medium">Send confirmation email</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">Notify the customer with booking details</p>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="bg-green-600 text-white hover:bg-green-700" disabled={confirm.isPending}>
          <CheckCircle2 className="mr-1.5 h-4 w-4" />
          {confirm.isPending ? "Confirming…" : "Confirm Booking"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}
