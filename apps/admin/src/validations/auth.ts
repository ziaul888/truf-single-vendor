import { z } from "zod";

/** Rules for any newly chosen password (matches turf-api's NewPasswordSchema). */
export const NewPasswordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(200, "Password must be at most 200 characters");

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(200),
    newPassword: NewPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "New password must be different from the current one",
  })
  .refine((v) => v.confirmPassword === v.newPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
