import { z } from "zod";

// Mirrors turf-api's login schema so the form catches the same mistakes before sending.
export const LoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password").max(200),
});

export type LoginInput = z.infer<typeof LoginSchema>;
