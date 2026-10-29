"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Ground } from "@/hooks/useGrounds";
import type { TimeSlot } from "@/hooks/useAddBooking";
import { venueToday } from "@/lib/slot-format";
import type { AddBookingFormData } from "@/schemas";
import { CalendarClock } from "lucide-react";
import { takaLabel } from "@/components/features/bookings/booking-status-helpers";
import { SectionCard } from "./section-card";
import { SlotPicker } from "./slot-picker";

interface GroundSlotSectionProps {
  form: UseFormReturn<AddBookingFormData>;
  grounds: Ground[] | undefined;
  groundsLoading: boolean;
  slots: TimeSlot[] | undefined;
  slotsLoading: boolean;
}

export function GroundSlotSection({ form, grounds, groundsLoading, slots, slotsLoading }: GroundSlotSectionProps) {
  const { control, register, watch, setValue, clearErrors, formState: { errors } } = form;
  const [groundId, date, slotId] = [watch("groundId"), watch("date"), watch("slotId")];
  const selectedGround = grounds?.find((g) => g.id === groundId);

  return (
    <SectionCard n="1" title="Ground & Slot Selection" desc="Choose the ground, date and available time slot">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Ground <span className="text-destructive">*</span></Label>
            <Controller control={control} name="groundId" render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => { field.onChange(v); setValue("slotId", ""); }}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={groundsLoading ? "Loading…" : "Select a ground"} />
                </SelectTrigger>
                <SelectContent>
                  {grounds?.filter((g) => g.isActive).map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      <span className="capitalize">{g.sport}</span> — {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
            {errors.groundId && <p className="text-xs text-destructive">{errors.groundId.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="date">Date <span className="text-destructive">*</span></Label>
            <Input id="date" type="date" min={venueToday()} className="h-10" {...register("date", { onChange: () => setValue("slotId", "") })} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>
        </div>

        {selectedGround && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/50 px-4 py-2.5 text-sm">
            <span className="font-medium">{selectedGround.name}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{takaLabel(selectedGround.pricePerHour)}/hr</span>
            {selectedGround.peakPricePerHour !== null && (
              <span className="text-muted-foreground">(peak {takaLabel(selectedGround.peakPricePerHour)}/hr)</span>
            )}
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{selectedGround.openingTime} – {selectedGround.closingTime}</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Time Slot <span className="text-destructive">*</span></Label>
            {groundId && date && !slotsLoading && <span className="text-xs text-muted-foreground">Only open slots are shown</span>}
          </div>
          {!groundId || !date ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <CalendarClock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Select ground & date first</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Available time slots will appear here</p>
              </div>
            </div>
          ) : (
            <SlotPicker slots={slots ?? []} value={slotId} loading={slotsLoading} error={errors.slotId?.message}
              onChange={(id) => { setValue("slotId", id); clearErrors("slotId"); }} />
          )}
        </div>
      </div>
    </SectionCard>
  );
}
