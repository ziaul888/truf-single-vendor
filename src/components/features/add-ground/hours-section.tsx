"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AddGroundFormData } from "@/schemas/ground";
import { SectionCard } from "./section-card";
import { HourSelect } from "./hour-select";

import { WEEKDAYS } from "@/types/ground";

/** Opening/closing hours (saved) plus available days and slot length (not in v1). */
export function HoursSection({ form }: { form: UseFormReturn<AddGroundFormData> }) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const availableDays = watch("availableDays");

  return (
    <SectionCard
      n="3"
      title="Operating Hours"
      desc="Set open/close times and slot duration. Slots auto-generate from these."
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="openingTime">
              Opening time <span className="text-destructive">*</span>
            </Label>
            <HourSelect
              control={control}
              name="openingTime"
              id="openingTime"
              invalid={!!errors.openingTime}
            />
            {errors.openingTime && (
              <p className="text-destructive text-xs">{errors.openingTime.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="closingTime">
              Closing time <span className="text-destructive">*</span>
            </Label>
            <HourSelect
              control={control}
              name="closingTime"
              id="closingTime"
              invalid={!!errors.closingTime}
            />
            {errors.closingTime && (
              <p className="text-destructive text-xs">{errors.closingTime.message}</p>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          Time slots will be auto-generated between these hours. Minutes are set to :00; a closing
          time of 00:00 means midnight.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>
              Available days <span className="text-destructive">*</span>
            </Label>
            <Controller
              control={control}
              name="availableDays"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyday">Every day</SelectItem>
                    <SelectItem value="weekdays">Weekdays (Mon–Fri)</SelectItem>
                    <SelectItem value="weekends">Weekends (Sat–Sun)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Slot duration</Label>
            <Controller
              control={control}
              name="slotDuration"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {availableDays === "custom" && (
          <div className="space-y-2">
            <Label className="text-sm">Select days</Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const customDays = watch("customDays");
                const checked = customDays.includes(day);
                return (
                  <label
                    key={day}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                      checked ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        form.clearErrors("customDays");
                        const curr = watch("customDays");
                        setValue("customDays", v ? [...curr, day] : curr.filter((d) => d !== day));
                      }}
                      className="h-3.5 w-3.5"
                    />
                    <span className="capitalize">{day}</span>
                  </label>
                );
              })}
            </div>
            {errors.customDays && (
              <p className="text-destructive text-xs">{errors.customDays.message}</p>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
