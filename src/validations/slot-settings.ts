import { z } from "zod";
import { fromMinorUnits, toMinorUnits } from "@/lib/ground-format";
import type { SlotSettings } from "@/types/slot";

const wholeNumber = (min: number, max: number) =>
  z.coerce.number("Enter a number").int("Whole number").min(min, `At least ${min}`).max(max, `At most ${max}`);

/** The slot settings form. serviceFee is in whole ৳ here; turf-api stores the smallest unit. */
export const SlotSettingsSchema = z.object({
  advanceBookingDays: wholeNumber(1, 365),
  autoGenerate: z.boolean(),
  cancellationCutoffHours: wholeNumber(0, 72),
  notifyCustomerOnBlock: z.boolean(),
  notifyAdminOnBooking: z.boolean(),
  holdMinutes: wholeNumber(5, 30),
  serviceFee: z.coerce
    .number("Enter an amount")
    .min(0, "Can't be negative")
    .max(10000, "At most ৳10,000")
    .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, "At most 2 decimal places"),
  portalCashEnabled: z.boolean(),
});
export type SlotSettingsForm = z.infer<typeof SlotSettingsSchema>;

export const toSlotSettingsForm = (s: SlotSettings): SlotSettingsForm => ({ ...s, serviceFee: fromMinorUnits(s.serviceFee) });

export const fromSlotSettingsForm = (f: SlotSettingsForm): SlotSettings => ({ ...f, serviceFee: toMinorUnits(f.serviceFee) });
