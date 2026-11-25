"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useRecordPayment } from "@/hooks/useBookings";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import { fromMinorUnits, toMinorUnits } from "@/lib/ground-format";
import { slotPriceLabel } from "@/lib/slot-format";
import { OFFLINE_METHODS, isWalletMethod, type OfflineMethod } from "@/types/booking";
import { OptionalTrxIdSchema } from "@/validations/wallet";
import { TrxIdField } from "@/components/features/bookings/trx-id-field";
import type { DuePayment } from "./customer-due-payments";

const METHOD_LABEL: Record<OfflineMethod, string> = { cash: "Cash", bank_transfer: "Bank transfer", bkash: "bKash", nagad: "Nagad" };

const schemaFor = (dueMajor: number) => z.object({
  amount: z.coerce.number({ message: "Enter an amount" })
    .positive("Enter an amount above 0")
    .max(dueMajor, `At most ${slotPriceLabel(toMinorUnits(dueMajor))}`),
  method: z.enum(OFFLINE_METHODS),
  reference: OptionalTrxIdSchema,
  note:   z.string().max(500, "At most 500 characters"),
});
type CollectInput = z.input<ReturnType<typeof schemaFor>>;
type CollectData = z.output<ReturnType<typeof schemaFor>>;

/** Records cash, a bank transfer, bKash or Nagad against one due booking. Mount only while open. */
export function CollectDueDialog({ due, onClose }: { due: DuePayment; onClose: () => void }) {
  const dueMajor = fromMinorUnits(due.amount);
  const form = useForm<CollectInput, unknown, CollectData>({
    resolver: zodResolver(schemaFor(dueMajor)),
    defaultValues: { amount: dueMajor, method: "cash", reference: "", note: "" },
  });
  const record = useRecordPayment();
  const { register, control, formState: { errors } } = form;
  const wallet = isWalletMethod(useWatch({ control, name: "method" }));

  const onSubmit = form.handleSubmit((d) => {
    const note = d.note.trim();
    const reference = isWalletMethod(d.method) && d.reference ? d.reference : undefined;
    record.mutate(
      { id: due.bookingId, amount: toMinorUnits(d.amount), method: d.method, reference, ...(note ? { note } : {}) },
      {
        onSuccess: () => { toast.success(`Payment recorded for ${due.bookingNumber}`); onClose(); },
        onError: (err) => {
          const failure = toApiFailure(err);
          const placed = applyApiErrors(
            form, failure, { PAYMENT_EXCEEDS_DUE: "amount", REFERENCE_ALREADY_USED: "reference" }, ["amount", "method", "reference", "note"],
          );
          if (!placed) toast.error(failure.error);
        },
      },
    );
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Collect due payment</DialogTitle>
          <DialogDescription>
            Booking {due.bookingNumber} · {slotPriceLabel(due.amount)} due
          </DialogDescription>
        </DialogHeader>
        <form id="collect-due-form" onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="collect-amount">Amount (৳)</Label>
            <Input id="collect-amount" type="number" step="0.01" min="0" {...register("amount")} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Method</Label>
            <Controller control={control} name="method" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OFFLINE_METHODS.map((m) => <SelectItem key={m} value={m}>{METHOD_LABEL[m]}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
          </div>
          {wallet && <TrxIdField id="collect-reference" registration={register("reference")} error={errors.reference?.message} />}
          <div className="space-y-1.5">
            <Label htmlFor="collect-note">Note <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
            <Input id="collect-note" placeholder="e.g. Paid at the counter" {...register("note")} />
            {errors.note && <p className="text-xs text-destructive">{errors.note.message}</p>}
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="collect-due-form" disabled={record.isPending}>
            {record.isPending ? "Saving…" : "Record payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
