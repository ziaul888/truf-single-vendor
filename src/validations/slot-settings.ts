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
  multiSlotEnabled: z.boolean(),
  maxSlotsPerBooking: wholeNumber(2, 4),
  cashDepositEnabled: z.boolean(),
  cashDepositPercent: wholeNumber(1, 100),
});
export type SlotSettingsForm = z.infer<typeof SlotSettingsSchema>;

/**
 * The editable fields only; the audit fields stay out of the form (and out of the PUT). The bKash /
 * Nagad numbers and the card / bKash / Nagad switches are saved on Settings → Payments instead, so
 * this form never sends them.
 */
export type SlotSettingsInput = Omit<
  SlotSettings,
  "updatedAt" | "updatedBy" | "bkashNumber" | "nagadNumber" | "portalCardEnabled" | "portalBkashEnabled" | "portalNagadEnabled"
>;

export const toSlotSettingsForm = ({ updatedAt: _a, updatedBy: _b, ...s }: SlotSettings): SlotSettingsForm =>
  // An older API doesn't return the multi-slot or booking money fields yet: treat them as off (limit 4, 30%).
  ({
    ...s, serviceFee: fromMinorUnits(s.serviceFee), multiSlotEnabled: s.multiSlotEnabled ?? false, maxSlotsPerBooking: s.maxSlotsPerBooking ?? 4,
    cashDepositEnabled: s.cashDepositEnabled ?? false, cashDepositPercent: s.cashDepositPercent ?? 30,
  });

export const fromSlotSettingsForm = (f: SlotSettingsForm): SlotSettingsInput => ({ ...f, serviceFee: toMinorUnits(f.serviceFee) });
