import { z } from "zod";

/**
 * A customer's email, which they may not have: "" (blank) or a valid address. Mirrors turf-api's
 * OptionalEmailSchema, which turns "" into null. Without one the customer gets no booking emails.
 */
export const OptionalEmailSchema = z.string().trim().pipe(z.union([z.literal(""), z.email("Enter a valid email, or leave it empty")]));
