import { z } from "zod";
import { NewPasswordSchema } from "./auth";

// Mirrors turf-api's users.schemas.ts so forms catch the same mistakes before sending.
export const USER_ROLES = ["admin", "manager"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const EmailSchema = z.string().trim().toLowerCase().email("Enter a valid email");
const NameSchema = z.string().trim().min(1, "Enter a name").max(100);

export const CreateUserSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  role: z.enum(USER_ROLES),
  password: NewPasswordSchema,
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  role: z.enum(USER_ROLES),
  isActive: z.boolean(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const ResetPasswordSchema = z.object({ password: NewPasswordSchema });
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
