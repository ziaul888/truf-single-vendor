import { z } from "zod";

export const AddBookingSchema = z
  .object({
    groundId: z.string().min(1, "Select a ground"),
    date: z.string().min(1, "Select a date"),
    slotId: z.string().min(1, "Select a time slot"),
    customerName: z.string().min(2, "Name must be at least 2 characters"),
    customerPhone: z.string().min(10, "Enter a valid phone number"),
    customerEmail: z.string().email("Enter a valid email address"),
    bookingType: z.enum(["online", "offline"]),
    paymentMethod: z.enum(["card", "cash", "bank_transfer"]),
    paymentType: z.enum(["full", "partial"]),
    advanceAmount: z.coerce.number().min(0).optional(),
    dueDate: z.string().optional(),
    partialNote: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.bookingType === "offline" && data.paymentType === "partial") {
      if (!data.advanceAmount || data.advanceAmount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter advance amount",
          path: ["advanceAmount"],
        });
      }
      if (!data.dueDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a due date",
          path: ["dueDate"],
        });
      }
    }
  });

export type AddBookingFormData = z.infer<typeof AddBookingSchema>;
