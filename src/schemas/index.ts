import { z } from "zod";
import { OFFLINE_METHODS } from "@/types/booking";
import { venueToday } from "@/lib/slot-format";

/**
 * Staff (walk-in / phone) booking. Amounts are whole currency units here; the page converts
 * them to the smallest unit. "Advance must be below the slot price" is checked on submit,
 * because the price comes from the chosen slot.
 */
export const AddBookingSchema = z
  .object({
    groundId: z.string().min(1, "Select a ground"),
    date: z.string().min(1, "Select a date").refine((d) => d >= venueToday(), "Date can't be in the past"),
    slotId: z.string().min(1, "Select a time slot"),
    customerName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
    customerPhone: z.string().trim().refine((p) => p.replace(/\D/g, "").length >= 10, "Enter a valid phone number"),
    customerEmail: z.string().trim().email("Enter a valid email address"),
    /** full → confirmed + paid · partial → confirmed + partial · none → pending + unpaid */
    paymentType: z.enum(["full", "partial", "none"]),
    paymentMethod: z.enum(OFFLINE_METHODS),
    advanceAmount: z.coerce.number().min(0).optional(),
    dueDate: z.string().optional(),
    partialNote: z.string().trim().max(500, "Keep the note under 500 characters").optional(),
    notes: z.string().trim().max(1000, "Keep notes under 1000 characters").optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentType !== "partial") return;
    if (!data.advanceAmount || data.advanceAmount <= 0) {
      ctx.addIssue({ code: "custom", message: "Enter the advance amount", path: ["advanceAmount"] });
    }
    if (data.dueDate && data.dueDate < venueToday()) {
      ctx.addIssue({ code: "custom", message: "Due date can't be in the past", path: ["dueDate"] });
    }
  });

export type AddBookingFormData = z.infer<typeof AddBookingSchema>;
