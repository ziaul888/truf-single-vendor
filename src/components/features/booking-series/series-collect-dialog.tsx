"use client";

import { useForm, useWatch, Controller, type Resolver, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { PAYMENT_METHOD_LABEL } from "@/components/features/bookings/booking-status-helpers";
import { TrxIdField } from "@/components/features/bookings/trx-id-field";
import { keepKeyboardClosed } from "@/components/features/bookings/keep-keyboard-closed";
import { useCollectSeriesPayment } from "@/hooks/useBookingSeries";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import { fromMinorUnits, toMinorUnits } from "@/lib/ground-format";
import { monthLabel } from "@/lib/series-format";
import { slotPriceLabel } from "@/lib/slot-format";
import { OFFLINE_METHODS, isWalletMethod } from "@/types/booking";
import type { BookingSeries } from "@/types/booking-series";
import { OptionalTrxIdSchema } from "@/validations/wallet";
import { Banknote } from "lucide-react";
import { toast } from "sonner";

const ALL_MONTHS = "all";

/** `dueOf` gives a month's due in whole currency units ("all": the whole series). */
const collectSchema = (dueOf: (month: string) => number) =>
  z.object({
    month: z.string(),
    amount: z.coerce.number().positive("Enter an amount above 0"),
    method: z.enum(OFFLINE_METHODS),
    reference: OptionalTrxIdSchema,
  }).superRefine((v, ctx) => {
    const due = dueOf(v.month);
    if (v.amount > due) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: `Can't be more than the ${slotPriceLabel(toMinorUnits(due))} due` });
    }
  });
type CollectForm = z.infer<ReturnType<typeof collectSchema>>;

interface SeriesCollectDialogProps {
  series: BookingSeries;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/** Records cash, a bank transfer, bKash or Nagad against one month of a repeat booking, or all of it. */
export function SeriesCollectDialog({ series, open, onOpenChange }: SeriesCollectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={keepKeyboardClosed}>
        {open && <CollectForm series={series} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

type Form = UseFormReturn<CollectForm>;

function MonthField({ form, series, dueOf }: { form: Form; series: BookingSeries; dueOf: (month: string) => number }) {
  return (
    <div className="space-y-1.5">
      <Label>Month</Label>
      <Controller control={form.control} name="month" render={({ field }) => (
        <Select value={field.value} onValueChange={(v) => { field.onChange(v); form.setValue("amount", dueOf(v)); }}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_MONTHS}>All months · {slotPriceLabel(series.totals.due)}</SelectItem>
            {series.months.filter((m) => m.due > 0).map((m) => (
              <SelectItem key={m.month} value={m.month}>{monthLabel(m.month)} · {slotPriceLabel(m.due)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )} />
    </div>
  );
}

function AmountMethodFields({ form, maxAmount }: { form: Form; maxAmount: number }) {
  const { register, control, formState: { errors } } = form;
  const method = useWatch({ control, name: "method" });
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="series-pay-amount">Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm font-medium text-muted-foreground">৳</span>
            <Input id="series-pay-amount" type="number" step="0.01" min={0} max={maxAmount} className="h-10 pl-7" {...register("amount")} />
          </div>
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Method</Label>
          <Controller control={control} name="method" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {OFFLINE_METHODS.map((m) => <SelectItem key={m} value={m}>{PAYMENT_METHOD_LABEL[m]}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
        </div>
      </div>
      {isWalletMethod(method) && <TrxIdField id="series-pay-reference" registration={register("reference")} error={errors.reference?.message} />}
    </>
  );
}

function CollectForm({ series, onClose }: { series: BookingSeries; onClose: () => void }) {
  const collect = useCollectSeriesPayment();
  const dueMonths = series.months.filter((m) => m.due > 0);
  const dueOf = (month: string) =>
    fromMinorUnits(month === ALL_MONTHS ? series.totals.due : series.months.find((m) => m.month === month)?.due ?? 0);
  // One month owing: start on it; otherwise the whole due.
  const firstMonth = dueMonths.length === 1 ? dueMonths[0].month : ALL_MONTHS;
  const form = useForm<CollectForm>({
    resolver: zodResolver(collectSchema(dueOf)) as Resolver<CollectForm>,
    defaultValues: { month: firstMonth, amount: dueOf(firstMonth), method: "cash", reference: "" },
  });
  const month = useWatch({ control: form.control, name: "month" });

  function onSubmit(v: CollectForm) {
    const reference = isWalletMethod(v.method) && v.reference ? v.reference : undefined;
    const amount = toMinorUnits(v.amount);
    collect.mutate(
      { id: series.id, amount, method: v.method, reference, ...(v.month !== ALL_MONTHS && { month: v.month }) },
      {
        onSuccess: () => {
          toast.success(`${slotPriceLabel(amount)} recorded${v.month === ALL_MONTHS ? "" : ` for ${monthLabel(v.month)}`}`);
          onClose();
        },
        onError: (err) => {
          const failure = toApiFailure(err);
          if (!applyApiErrors(form, failure, { AMOUNT_EXCEEDS_DUE: "amount", REFERENCE_ALREADY_USED: "reference" })) toast.error(failure.error);
        },
      },
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><Banknote className="h-5 w-5 text-green-600" />Collect Payment</DialogTitle>
        <DialogDescription>
          {slotPriceLabel(series.totals.due)} is due on this repeat booking for {series.customer.name}.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <MonthField form={form} series={series} dueOf={dueOf} />
        <AmountMethodFields form={form} maxAmount={dueOf(month)} />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={collect.isPending}>{collect.isPending ? "Recording…" : "Record Payment"}</Button>
      </DialogFooter>
    </form>
  );
}
