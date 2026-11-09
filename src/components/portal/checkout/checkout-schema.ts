import { z } from "zod";
import { OptionalEmailSchema } from "@/validations/customer";
import { TrxIdSchema } from "@/validations/wallet";

const isWallet = (m: string) => m === "bkash" || m === "nagad";

export const EMAIL_REQUIRED_MESSAGE = "Enter your email: your booking link is sent there. Or sign in with your phone";

const CheckoutFields = z.object({
  customerName: z.string().trim().min(2, "Enter your full name (at least 2 characters)").max(100),
  /** "" for none: only when signed in (see checkoutFormSchema). */
  customerEmail: OptionalEmailSchema,
  customerPhone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a phone number with at least 10 digits"),
  paymentMethod: z.enum(["card", "cash", "bkash", "nagad"]),
  /** bKash / Nagad only: the TrxID and the number the money was sent from. */
  reference: z.string(),
  payerNumber: z.string(),
  acceptTerms: z.boolean().refine((v) => v, "Please accept the terms to continue"),
});

/**
 * A guest must give an email, as the booking link only reaches them there (turf-api: 400
 * EMAIL_REQUIRED); signed in with their phone it's optional.
 */
export const checkoutFormSchema = (signedIn: boolean) => CheckoutFields.superRefine((v, ctx) => {
  if (!signedIn && !v.customerEmail) ctx.addIssue({ code: "custom", path: ["customerEmail"], message: EMAIL_REQUIRED_MESSAGE });
  if (!isWallet(v.paymentMethod)) return;
  const trx = TrxIdSchema.safeParse(v.reference);
  if (!trx.success) ctx.addIssue({ code: "custom", path: ["reference"], message: trx.error.issues[0]?.message ?? "Enter the TrxID" });
  if (v.payerNumber.replace(/\D/g, "").length < 10) {
    ctx.addIssue({ code: "custom", path: ["payerNumber"], message: "Enter the number you sent the money from" });
  }
});

export type CheckoutFormValues = z.infer<typeof CheckoutFields>;

/** API validation `details[].field` names that map onto form fields. */
export const CHECKOUT_FIELDS = ["customerName", "customerEmail", "customerPhone", "paymentMethod", "reference", "payerNumber"] as const;
