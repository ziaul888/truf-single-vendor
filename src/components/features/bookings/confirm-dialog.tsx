"use client";

import { useForm, useWatch, Controller } from "react-hook-form";
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
import { OFFLINE_METHODS, isWalletMethod, type Booking } from "@/types/booking";
import { OptionalTrxIdSchema } from "@/validations/wallet";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, isAwaitingWalletVerification, paymentStatusVariant,
} from "./booking-status-helpers";
import { PayAtVenueBadge } from "./pay-at-venue-badge";
import { TrxIdField } from "./trx-id-field";
import { WalletPaymentRows } from "./wallet-payment-info";

const ConfirmSchema = z.object({
  markPaid: z.boolean(),
  method: z.enum(OFFLINE_METHODS),
  reference: OptionalTrxIdSchema,
  notifyCustomer: z.boolean(),
});
type ConfirmForm = z.infer<typeof ConfirmSchema>;

interface ConfirmDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/**
 * Confirms a pending staff or pay-at-venue booking, optionally recording the payment and emailing the
 * customer. For a portal bKash / Nagad booking it is "Verify": the payment the customer sent is marked received.
 */
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
  const verify = isAwaitingWalletVerification(booking);
  // A verified bKash / Nagad payment covers the total: nothing is left to mark paid.
  const hasDue = booking.due > 0 && !verify;
  const { control, watch, register, handleSubmit, formState: { errors } } = useForm<ConfirmForm>({
    resolver: zodResolver(ConfirmSchema),
    defaultValues: { markPaid: false, method: "cash", reference: "", notifyCustomer: true },
  });
  const markPaid = watch("markPaid");
  const wallet = isWalletMethod(useWatch({ control, name: "method" }));

  function onSubmit(values: ConfirmForm) {
    const paid = hasDue && values.markPaid;
    const reference = paid && isWalletMethod(values.method) && values.reference ? values.reference : undefined;
    confirm.mutate(
      { id: booking.id, markPaid: paid, method: paid ? values.method : undefined, reference, notifyCustomer: values.notifyCustomer },
      {
        onSuccess: () => {
          const what = verify ? "payment verified and booking confirmed" : `confirmed${paid ? " and payment recorded" : ""}`;
          toast.success(`Booking ${booking.bookingNumber} ${what}${values.notifyCustomer ? " · customer emailed" : ""}`);
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
          <CheckCircle2 className="h-5 w-5 text-green-600" />{verify ? "Verify Payment" : "Confirm Booking"}
        </DialogTitle>
        <DialogDescription>
          {verify
            ? <>Check your {PAYMENT_METHOD_LABEL[booking.walletPayment!.method]} app for this payment before you verify booking{" "}</>
            : <>Confirm booking{" "}</>}
          <span className="font-mono font-medium">{booking.bookingNumber}</span> for{" "}
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
          {booking.walletPayment && <WalletPaymentRows payment={booking.walletPayment} />}
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
                  {verify ? "Verifying records the payment the customer sent"
                    : hasDue ? `Record ${slotPriceLabel(booking.due)} collected now` : "Nothing due on this booking"}
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
            {hasDue && markPaid && wallet && (
              <TrxIdField id="confirm-reference" registration={register("reference")} error={errors.reference?.message} />
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
          {confirm.isPending ? "Confirming…" : verify ? "Verify & Confirm" : "Confirm Booking"}
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
