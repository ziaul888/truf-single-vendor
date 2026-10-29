"use client";

import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useRecordPayment } from "@/hooks/useBookings";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import { fromMinorUnits, toMinorUnits } from "@/lib/ground-format";
import { slotPriceLabel } from "@/lib/slot-format";
import { OFFLINE_METHODS, type Booking } from "@/types/booking";
import { Banknote } from "lucide-react";
import { toast } from "sonner";
import { PAYMENT_METHOD_LABEL } from "./booking-status-helpers";

const paymentSchema = (dueMajor: number) =>
  z.object({
    amount: z.coerce.number()
      .positive("Enter an amount above 0")
      .max(dueMajor, `Can't be more than the ${slotPriceLabel(toMinorUnits(dueMajor))} due`),
    method: z.enum(OFFLINE_METHODS),
    note: z.string().trim().max(500, "Keep the note under 500 characters"),
  });
type PaymentForm = z.infer<ReturnType<typeof paymentSchema>>;

interface CollectPaymentDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/** Records cash or a bank transfer against what's still due. */
export function CollectPaymentDialog({ booking, open, onOpenChange }: CollectPaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && <CollectPaymentForm booking={booking} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function CollectPaymentForm({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const record = useRecordPayment();
  const dueMajor = fromMinorUnits(booking.due);
  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema(dueMajor)) as Resolver<PaymentForm>,
    defaultValues: { amount: dueMajor, method: "cash", note: "" },
  });
  const { register, control, handleSubmit, formState: { errors } } = form;

  function onSubmit(values: PaymentForm) {
    record.mutate(
      { id: booking.id, amount: toMinorUnits(values.amount), method: values.method, note: values.note || undefined },
      {
        onSuccess: () => {
          toast.success(`${slotPriceLabel(toMinorUnits(values.amount))} recorded on ${booking.bookingNumber}`);
          onClose();
        },
        onError: (err) => {
          const failure = toApiFailure(err);
          if (!applyApiErrors(form, failure, { PAYMENT_EXCEEDS_DUE: "amount" })) toast.error(failure.error);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-green-600" />Collect Payment
        </DialogTitle>
        <DialogDescription>
          {slotPriceLabel(booking.due)} is due on <span className="font-mono font-medium">{booking.bookingNumber}</span>.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="pay-amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm font-medium text-muted-foreground">৳</span>
              <Input id="pay-amount" type="number" step="0.01" min={0} max={dueMajor} className="pl-7" {...register("amount")} />
            </div>
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Method</Label>
            <Controller control={control} name="method" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OFFLINE_METHODS.map((m) => <SelectItem key={m} value={m}>{PAYMENT_METHOD_LABEL[m]}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pay-note">Note <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Textarea id="pay-note" rows={2} className="resize-none text-sm" placeholder="e.g. Paid at the counter" {...register("note")} />
          {errors.note && <p className="text-xs text-destructive">{errors.note.message}</p>}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={record.isPending}>{record.isPending ? "Recording…" : "Record Payment"}</Button>
      </DialogFooter>
    </form>
  );
}
