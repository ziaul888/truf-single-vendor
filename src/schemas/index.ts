import { z } from "zod";
import { OFFLINE_METHODS } from "@/types/booking";
import { WEEKDAYS } from "@/types/ground";
import { addDays, venueToday } from "@/lib/slot-format";
import { OptionalEmailSchema } from "@/validations/customer";
import { OptionalTrxIdSchema } from "@/validations/wallet";

/** A fixed repeat can run up to this many days after its first date. */
export const SERIES_MAX_DAYS = 30;

const AddBookingFields = z.object({
  groundId: z.string().min(1, "Select a ground"),
  date: z.string().min(1, "Select a date").refine((d) => d >= venueToday(), "Date can't be in the past"),
  slotId: z.string().min(1, "Select a time slot"),
  customerName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  customerPhone: z.string().trim().refine((p) => p.replace(/\D/g, "").length >= 10, "Enter a valid phone number"),
  /** Optional; "" for none. */
  customerEmail: OptionalEmailSchema,
  /** full → confirmed + paid · partial → confirmed + partial · none → pending + unpaid */
  paymentType: z.enum(["full", "partial", "none"]),
  paymentMethod: z.enum(OFFLINE_METHODS),
  /** bKash / Nagad TrxID, optional; "" for none. */
  paymentReference: OptionalTrxIdSchema.optional(),
  advanceAmount: z.coerce.number().min(0).optional(),
  dueDate: z.string().optional(),
  partialNote: z.string().trim().max(500, "Keep the note under 500 characters").optional(),
  notes: z.string().trim().max(1000, "Keep notes under 1000 characters").optional(),
  // Repeat booking (a series): only read when `repeat` is on.
  repeat: z.boolean().optional(),
  /** fixed: until a date · ongoing: keeps going until stopped */
  repeatMode: z.enum(["fixed", "ongoing"]).optional(),
  weekdays: z.array(z.enum(WEEKDAYS)).optional(),
  untilDate: z.string().optional(),
  /** The slot's start hour as a string ("21"), the way the select holds it; "" for none. */
  startHour: z.string().optional(),
});

type PaymentFields = Pick<z.infer<typeof AddBookingFields>, "paymentType" | "advanceAmount" | "dueDate">;

/** `withDueDate` false: a repeat booking has no due date (the field is hidden). */
function checkAdvance(data: PaymentFields, ctx: z.RefinementCtx, withDueDate = true) {
  if (data.paymentType !== "partial") return;
  if (!data.advanceAmount || data.advanceAmount <= 0) {
    ctx.addIssue({ code: "custom", message: "Enter the advance amount", path: ["advanceAmount"] });
  }
  if (withDueDate && data.dueDate && data.dueDate < venueToday()) {
    ctx.addIssue({ code: "custom", message: "Due date can't be in the past", path: ["dueDate"] });
  }
}

/**
 * Staff (walk-in / phone) booking. Amounts are whole currency units here; the page converts
 * them to the smallest unit. "Advance must be below the slot price" is checked on submit,
 * because the price comes from the chosen slot.
 */
export const AddBookingSchema = AddBookingFields.superRefine((data, ctx) => checkAdvance(data, ctx));

/** The same form with Repeat on: an hour and weekdays instead of one slot. */
export const RepeatBookingSchema = AddBookingFields.extend({
  slotId: z.string(),
  repeat: z.literal(true),
  repeatMode: z.enum(["fixed", "ongoing"]),
  weekdays: z.array(z.enum(WEEKDAYS)).min(1, "Pick at least one day"),
  untilDate: z.string(),
  startHour: z.string().min(1, "Pick the time"),
}).superRefine((data, ctx) => {
  checkAdvance(data, ctx, false);
  if (data.repeatMode !== "fixed") return;
  const issue = (message: string) => ctx.addIssue({ code: "custom", message, path: ["untilDate"] });
  if (!data.untilDate) issue("Pick the last date");
  else if (data.untilDate < data.date) issue("Must be on or after the start date");
  else if (data.untilDate > addDays(data.date, SERIES_MAX_DAYS)) issue(`Up to ${SERIES_MAX_DAYS} days after the start date`);
});

export type AddBookingFormData = z.infer<typeof AddBookingSchema>;
