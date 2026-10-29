"use client";

import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import { BLOCK_REASON_LABEL, addDays, venueToday } from "@/lib/slot-format";
import { useCreateClosure } from "@/hooks/useSlots";
import { useGrounds } from "@/hooks/useGrounds";
import { BLOCK_REASONS } from "@/types/slot";

const MAX_DAYS = 31;

const dayCount = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000) + 1;

// Mirrors turf-api's rules so mistakes show before sending.
const ClosureSchema = z
  .object({
    fromDate: z.string().min(1, "Pick a start date"),
    toDate: z.string().min(1, "Pick an end date"),
    allGrounds: z.boolean(),
    groundIds: z.array(z.string()),
    reason: z.enum(BLOCK_REASONS),
    note: z.string().trim().max(500, "At most 500 characters").optional(),
    publicLabel: z.string().trim().max(100, "At most 100 characters").optional(),
  })
  .refine((v) => v.fromDate >= venueToday(), { path: ["fromDate"], message: "Can't start in the past" })
  .refine((v) => v.toDate >= v.fromDate, { path: ["toDate"], message: "Must be on or after the start date" })
  .refine((v) => dayCount(v.fromDate, v.toDate) <= MAX_DAYS, { path: ["toDate"], message: `At most ${MAX_DAYS} days` })
  .refine((v) => v.allGrounds || v.groundIds.length > 0, { path: ["groundIds"], message: "Pick at least one ground" });
type ClosureForm = z.infer<typeof ClosureSchema>;

const defaults = (): ClosureForm => ({
  fromDate: venueToday(), toDate: venueToday(), allGrounds: true, groundIds: [], reason: "event", note: "", publicLabel: "",
});

/** Admin form: close every ground (or some) for a date range. */
export function ClosureFormSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle>Close venue</SheetTitle>
          <SheetDescription>Blocks every free slot in the range, including slots created there later.</SheetDescription>
        </SheetHeader>
        {open && <ClosureForm onDone={onClose} />}
      </SheetContent>
    </Sheet>
  );
}

function ClosureForm({ onDone }: { onDone: () => void }) {
  const create = useCreateClosure();
  const { data: grounds } = useGrounds();
  const form = useForm<ClosureForm>({
    resolver: zodResolver(ClosureSchema) as Resolver<ClosureForm>,
    defaultValues: defaults(),
  });
  const { register, control, watch, setValue, formState: { errors, isSubmitting } } = form;
  const allGrounds = watch("allGrounds");
  const picked = watch("groundIds");
  const fromDate = watch("fromDate");

  async function onSubmit(v: ClosureForm) {
    try {
      const res = await create.mutateAsync({
        fromDate: v.fromDate,
        toDate: v.toDate,
        groundIds: v.allGrounds ? [] : v.groundIds,
        reason: v.reason,
        note: v.note || undefined,
        publicLabel: v.publicLabel || undefined,
      });
      toast.success(`Closed ${res.blocked} slot${res.blocked === 1 ? "" : "s"}`, {
        description: res.skippedBooked
          ? `${res.skippedBooked} booked slot${res.skippedBooked === 1 ? " was" : "s were"} not affected.`
          : undefined,
      });
      onDone();
    } catch (err) {
      const failure = toApiFailure(err);
      const shown = applyApiErrors(form, failure, { INVALID_DATE_RANGE: "toDate", GROUND_NOT_FOUND: "groundIds" });
      if (!shown) toast.error(failure.error);
    }
  }

  function toggleGround(id: string, on: boolean) {
    setValue("groundIds", on ? [...picked, id] : picked.filter((g) => g !== id), { shouldValidate: true });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="contents">
      <SheetBody className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field id="fromDate" label="From" error={errors.fromDate?.message}>
            <Input id="fromDate" type="date" min={venueToday()} {...register("fromDate")} />
          </Field>
          <Field id="toDate" label="To" error={errors.toDate?.message}>
            <Input id="toDate" type="date" min={fromDate} max={fromDate ? addDays(fromDate, MAX_DAYS - 1) : undefined} {...register("toDate")} />
          </Field>
        </div>
        <p className="-mt-2 text-[11px] text-muted-foreground">Up to {MAX_DAYS} days, starting today or later.</p>

        <div className="space-y-2">
          <Label>Grounds</Label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Controller control={control} name="allGrounds" render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
            )} />
            All grounds <span className="font-normal text-muted-foreground">(including grounds added later)</span>
          </label>
          {!allGrounds && (
            <div className="grid grid-cols-1 gap-1.5 rounded-lg border p-3 sm:grid-cols-2">
              {grounds?.map((g) => (
                <label key={g.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={picked.includes(g.id)} onCheckedChange={(v) => toggleGround(g.id, v === true)} />
                  <span className={cn(!g.isActive && "text-muted-foreground")}>{g.name}</span>
                </label>
              ))}
            </div>
          )}
          {errors.groundIds && <p className="text-xs text-destructive">{errors.groundIds.message}</p>}
        </div>

        <Field id="reason" label="Reason (staff only)" error={errors.reason?.message}>
          <Controller control={control} name="reason" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="reason"><SelectValue /></SelectTrigger>
              <SelectContent>
                {BLOCK_REASONS.map((r) => <SelectItem key={r} value={r}>{BLOCK_REASON_LABEL[r]}</SelectItem>)}
              </SelectContent>
            </Select>
          )} />
        </Field>

        <Field id="publicLabel" label="Message for customers" hint='Shown on the booking page, e.g. "Closed for Eid". Leave empty to show "Closed".' error={errors.publicLabel?.message}>
          <Input id="publicLabel" maxLength={100} placeholder="Closed for Eid" {...register("publicLabel")} />
        </Field>

        <Field id="note" label="Note (staff only)" error={errors.note?.message}>
          <Textarea id="note" rows={3} maxLength={500} className="resize-none" {...register("note")} />
        </Field>

        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          Booked slots stay booked. Cancelling them will be possible once bookings are connected.
        </p>
      </SheetBody>
      <SheetFooter>
        <Button type="button" variant="outline" className="w-full" onClick={onDone}>Cancel</Button>
        <Button type="submit" variant="destructive" className="w-full gap-1.5" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Close venue
        </Button>
      </SheetFooter>
    </form>
  );
}

function Field({ id, label, hint, error, children }: {
  id: string; label: string; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
