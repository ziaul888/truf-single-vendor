"use client";

import { useForm, useWatch, Controller, type Control, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { isCancellable } from "@/components/features/bookings/booking-status-helpers";
import { keepKeyboardClosed } from "@/components/features/bookings/keep-keyboard-closed";
import { useStopSeries } from "@/hooks/useBookingSeries";
import { toApiFailure } from "@/lib/api-error";
import { shortDate } from "@/lib/series-format";
import { slotPriceLabel, venueToday } from "@/lib/slot-format";
import type { BookingSeries } from "@/types/booking-series";
import { CircleStop } from "lucide-react";
import { toast } from "sonner";

const StopSchema = z.object({
  fromDate: z.string().min(1, "Pick a date").refine((d) => d >= venueToday(), "Can't be in the past"),
  refund: z.boolean(),
  reason: z.string().trim().max(500, "Keep the reason under 500 characters"),
});
type StopForm = z.infer<typeof StopSchema>;

interface SeriesStopDialogProps {
  series: BookingSeries;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** The series changed elsewhere (already stopped): reload it. */
  onStale: () => void;
}

/** Stops a repeat booking: its bookings from a date on are cancelled (and refunded if ticked). */
export function SeriesStopDialog({ series, open, onOpenChange, onStale }: SeriesStopDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={keepKeyboardClosed}>
        {open && <StopForm series={series} onStale={onStale} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function StopForm({ series, onStale, onClose }: { series: BookingSeries; onStale: () => void; onClose: () => void }) {
  const stop = useStopSeries();
  const form = useForm<StopForm>({
    resolver: zodResolver(StopSchema),
    // Cancellation means a full refund of what was paid, so refund is on by default.
    defaultValues: { fromDate: venueToday(), refund: true, reason: "" },
  });
  const fromDate = useWatch({ control: form.control, name: "fromDate" });
  const later = series.bookings.filter((b) => b.date >= fromDate && isCancellable(b));
  const paidLater = later.reduce((sum, b) => sum + b.paid, 0);

  function onSubmit(v: StopForm) {
    const refund = paidLater > 0 && v.refund;
    stop.mutate(
      { id: series.id, fromDate: v.fromDate, refund, reason: v.reason || undefined },
      {
        onSuccess: () => { toast.success(`Repeat stopped from ${shortDate(v.fromDate)}${refund ? " with refund" : ""}`); onClose(); },
        onError: (err) => {
          const failure = toApiFailure(err);
          toast.error(failure.error);
          if (failure.code === "SERIES_STOPPED") { onStale(); onClose(); }
        },
      },
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><CircleStop className="h-5 w-5 text-destructive" />Stop Repeat</DialogTitle>
        <DialogDescription>
          Bookings from this date on are cancelled and their slots open again. Earlier bookings stay.
        </DialogDescription>
      </DialogHeader>
      <StopFields form={form} cancelCount={later.length} paidLater={paidLater} />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Keep Repeating</Button>
        <Button type="submit" variant="destructive" disabled={stop.isPending}>{stop.isPending ? "Stopping…" : "Stop Repeat"}</Button>
      </DialogFooter>
    </form>
  );
}

function StopFields({ form, cancelCount, paidLater }: { form: UseFormReturn<StopForm>; cancelCount: number; paidLater: number }) {
  const { control, register, formState: { errors } } = form;
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-1.5">
        <Label htmlFor="stop-from">Stop from</Label>
        <Input id="stop-from" type="date" min={venueToday()} className="h-10" {...register("fromDate")} />
        {errors.fromDate
          ? <p className="text-xs text-destructive">{errors.fromDate.message}</p>
          : <p className="text-[11px] text-muted-foreground">{cancelCount} {cancelCount === 1 ? "booking" : "bookings"} will be cancelled</p>}
      </div>
      {paidLater > 0 && <RefundRow control={control} paid={paidLater} />}
      <div className="space-y-1.5">
        <Label htmlFor="stop-reason">Reason <span className="font-normal text-muted-foreground">(optional)</span></Label>
        <Textarea id="stop-reason" rows={2} className="resize-none" placeholder="e.g. Team stopped playing" {...register("reason")} />
        {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
      </div>
    </div>
  );
}

function RefundRow({ control, paid }: { control: Control<StopForm>; paid: number }) {
  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <Controller control={control} name="refund" render={({ field }) => (
        <Checkbox id="stop-refund" className="mt-0.5" checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
      )} />
      <div>
        <Label htmlFor="stop-refund" className="cursor-pointer font-medium">Refund what was paid</Label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Refund {slotPriceLabel(paid)} paid on those bookings. Cash, bank transfers, bKash and Nagad are marked refunded, so pay them back by hand.
        </p>
      </div>
    </div>
  );
}
