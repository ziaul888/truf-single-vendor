"use client";

import { Controller, useForm } from "react-hook-form";
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
import { OFFLINE_METHODS, type OfflineMethod } from "@/types/booking";
import type { DuePayment } from "./customer-due-payments";

const METHOD_LABEL: Record<OfflineMethod, string> = { cash: "Cash", bank_transfer: "Bank transfer" };

const schemaFor = (dueMajor: number) => z.object({
  amount: z.coerce.number({ message: "Enter an amount" })
    .positive("Enter an amount above 0")
    .max(dueMajor, `At most ${slotPriceLabel(toMinorUnits(dueMajor))}`),
  method: z.enum(OFFLINE_METHODS),
  note:   z.string().max(500, "At most 500 characters"),
});
type CollectInput = z.input<ReturnType<typeof schemaFor>>;
type CollectData = z.output<ReturnType<typeof schemaFor>>;

/** Records cash or a bank transfer against one due booking. Mount only while open. */
export function CollectDueDialog({ due, onClose }: { due: DuePayment; onClose: () => void }) {
  const dueMajor = fromMinorUnits(due.amount);
  const form = useForm<CollectInput, unknown, CollectData>({
    resolver: zodResolver(schemaFor(dueMajor)),
    defaultValues: { amount: dueMajor, method: "cash", note: "" },
  });
  const record = useRecordPayment();
  const { register, control, formState: { errors } } = form;

  const onSubmit = form.handleSubmit((d) => {
    const note = d.note.trim();
    record.mutate(
      { id: due.bookingId, amount: toMinorUnits(d.amount), method: d.method, ...(note ? { note } : {}) },
      {
        onSuccess: () => { toast.success(`Payment recorded for ${due.bookingNumber}`); onClose(); },
        onError: (err) => {
          const failure = toApiFailure(err);
          const placed = applyApiErrors(form, failure, { PAYMENT_EXCEEDS_DUE: "amount" }, ["amount", "method", "note"]);
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
