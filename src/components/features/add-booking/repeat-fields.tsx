"use client";

import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { WeekdayPicker } from "@/components/features/slots/weekday-picker";
import type { Ground } from "@/hooks/useGrounds";
import { addDays, clockTime } from "@/lib/slot-format";
import { cn } from "@/lib/utils";
import { SERIES_MAX_DAYS, type AddBookingFormData } from "@/schemas";
import { WEEKDAYS, type Weekday } from "@/types/ground";
import { Repeat } from "lucide-react";

type Form = UseFormReturn<AddBookingFormData>;

/** getUTCDay() order: Sunday first. */
const BY_DAY_INDEX: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const weekdayOf = (date: string) => BY_DAY_INDEX[new Date(`${date}T00:00:00Z`).getUTCDay()];

/** The ground's slots as "HH:MM" start and end: opening to closing, one slot length apart (90 → :30 starts). */
export function groundSlotTimes(ground: Pick<Ground, "openingHour" | "closingHour" | "slotDurationMinutes">) {
  const step = ground.slotDurationMinutes;
  const at = (m: number) => clockTime(Math.floor(m / 60), m % 60);
  const times: { start: string; end: string }[] = [];
  for (let m = ground.openingHour * 60; m + step <= ground.closingHour * 60; m += step) times.push({ start: at(m), end: at(m + step) });
  return times;
}

/** "Repeat" switch: the whole row is the tap target. Turning it on fills sensible defaults. */
export function RepeatToggle({ form, slotStartTime }: { form: Form; slotStartTime?: string }) {
  const { control, getValues, setValue, clearErrors } = form;
  const repeat = useWatch({ control, name: "repeat" }) ?? false;

  function onToggle(on: boolean) {
    setValue("repeat", on);
    clearErrors(["slotId", "startHour", "weekdays", "untilDate"]);
    if (!on) return;
    const { date, weekdays, untilDate, startHour } = getValues();
    // Start from the picked date's weekday and slot, booked for four weeks.
    if (!weekdays?.length && date) setValue("weekdays", [weekdayOf(date)]);
    if (!untilDate && date) setValue("untilDate", addDays(date, 28));
    if (!startHour && slotStartTime) setValue("startHour", slotStartTime);
  }

  return (
    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5">
      <Repeat className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">Repeat</span>
        <span className="block text-xs text-muted-foreground">Book the same hour on chosen days</span>
      </span>
      <Switch checked={repeat} onCheckedChange={onToggle} aria-label="Repeat booking" />
    </label>
  );
}

const MODES = [
  { value: "fixed", label: "Until a date" },
  { value: "ongoing", label: "Keeps going" },
] as const;

function ModeToggle({ form }: { form: Form }) {
  const mode = useWatch({ control: form.control, name: "repeatMode" }) ?? "fixed";
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1" role="radiogroup" aria-label="How long it repeats">
      {MODES.map((m) => (
        <button key={m.value} type="button" role="radio" aria-checked={mode === m.value}
          onClick={() => { form.setValue("repeatMode", m.value); form.clearErrors("untilDate"); }}
          className={cn("h-10 rounded-lg text-sm font-medium transition-colors",
            mode === m.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
          {m.label}
        </button>
      ))}
    </div>
  );
}

function DayChips({ form }: { form: Form }) {
  const { control, setValue, clearErrors, formState: { errors } } = form;
  const weekdays = useWatch({ control, name: "weekdays" }) ?? [];
  const everyDay = weekdays.length === WEEKDAYS.length;
  const set = (days: Weekday[]) => { setValue("weekdays", days); clearErrors("weekdays"); };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Days <span className="text-destructive">*</span></Label>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => set(everyDay ? [] : [...WEEKDAYS])}
          className={cn("rounded-lg border px-3 py-1.5 pointer-coarse:py-2.5 text-sm font-medium transition-colors",
            everyDay ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted")}>
          Every day
        </button>
      </div>
      <WeekdayPicker value={weekdays}
        onToggle={(day, on) => set(on ? WEEKDAYS.filter((d) => d === day || weekdays.includes(d)) : weekdays.filter((d) => d !== day))} />
      {errors.weekdays && <p className="text-xs text-destructive">{errors.weekdays.message}</p>}
    </div>
  );
}

function HourSelect({ form, ground }: { form: Form; ground?: Ground }) {
  const { control, formState: { errors } } = form;
  const times = ground ? groundSlotTimes(ground) : [];
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Time <span className="text-destructive">*</span></Label>
      <Controller control={control} name="startHour" render={({ field }) => (
        <Select value={field.value ?? ""} onValueChange={field.onChange} disabled={!ground}>
          <SelectTrigger className="h-10"><SelectValue placeholder={ground ? "Pick the time" : "Select a ground first"} /></SelectTrigger>
          <SelectContent>
            {times.map((t) => <SelectItem key={t.start} value={t.start}>{t.start}–{t.end}</SelectItem>)}
          </SelectContent>
        </Select>
      )} />
      {errors.startHour && <p className="text-xs text-destructive">{errors.startHour.message}</p>}
    </div>
  );
}

/** Repeat on: how long, which days and which hour. The "Starting" date is the section's date field. */
export function RepeatFields({ form, ground }: { form: Form; ground?: Ground }) {
  const { control, register, formState: { errors } } = form;
  const [mode, date] = [useWatch({ control, name: "repeatMode" }) ?? "fixed", useWatch({ control, name: "date" })];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <ModeToggle form={form} />
        {mode === "fixed" ? (
          <div className="space-y-2 pt-1">
            <Label className="text-sm font-medium" htmlFor="untilDate">Until <span className="text-destructive">*</span></Label>
            <Input id="untilDate" type="date" min={date} max={date ? addDays(date, SERIES_MAX_DAYS) : undefined} className="h-10"
              {...register("untilDate")} />
            {errors.untilDate
              ? <p className="text-xs text-destructive">{errors.untilDate.message}</p>
              : <p className="text-[11px] text-muted-foreground">Up to {SERIES_MAX_DAYS} days after the start date</p>}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Books new dates automatically as slots open, until you stop it. Money is counted per month.
          </p>
        )}
      </div>
      <DayChips form={form} />
      <HourSelect form={form} ground={ground} />
    </div>
  );
}
