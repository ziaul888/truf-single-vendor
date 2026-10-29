import { z } from "zod";

export const CheckoutFormSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name (at least 2 characters)").max(100),
  customerEmail: z.string().trim().email("Enter a valid email address"),
  customerPhone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a phone number with at least 10 digits"),
  paymentMethod: z.enum(["card", "cash"]),
  acceptTerms: z.boolean().refine((v) => v, "Please accept the terms to continue"),
});

export type CheckoutFormValues = z.infer<typeof CheckoutFormSchema>;

/** API validation `details[].field` names that map onto form fields. */
export const CHECKOUT_FIELDS = ["customerName", "customerEmail", "customerPhone", "paymentMethod"] as const;
