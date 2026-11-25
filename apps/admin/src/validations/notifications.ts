import { z } from "zod";
import type { NotificationSettings, NotificationsInput } from "@/types/settings";

// Mirrors turf-api's notification rules. The form keeps the API's shape so its
// dotted error paths (e.g. "staff.recipients.1") land on the right input as-is.

export const MAX_RECIPIENTS = 5;

const isEmail = (v: string) => z.email().safeParse(v).success;

/** Blank means "follow the venue" (sent as null). */
const optionalEmail = z.string().trim().refine((v) => !v || isEmail(v), "Enter a valid email");

export const RecipientSchema = z.string().trim().toLowerCase().email("Enter a valid email");

export const NotificationsSchema = z.object({
  email: z.object({
    fromName: z.string().trim().max(60, "At most 60 characters"),
    replyTo: optionalEmail,
  }),
  customer: z.object({
    refundIssued: z.boolean(),
    slotBlocked: z.boolean(),
  }),
  staff: z.object({
    recipients: z.array(RecipientSchema).max(MAX_RECIPIENTS, `At most ${MAX_RECIPIENTS} recipients`),
    newBooking: z.boolean(),
    customerCancelled: z.boolean(),
    dueDigest: z.boolean(),
  }),
});
export type NotificationsForm = z.infer<typeof NotificationsSchema>;

/** Every form path an API validation error can point at. */
export const NOTIFICATION_ERROR_FIELDS = [
  "email.fromName", "email.replyTo", "staff.recipients",
  ...Array.from({ length: MAX_RECIPIENTS }, (_, i) => `staff.recipients.${i}`),
] as const;

export const toNotificationsForm = ({ email, customer, staff }: NotificationSettings): NotificationsForm => ({
  email: { fromName: email.fromName ?? "", replyTo: email.replyTo ?? "" },
  customer: { refundIssued: customer.refundIssued, slotBlocked: customer.slotBlocked },
  staff: { ...staff, recipients: [...staff.recipients] },
});

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Only the sections that changed, with blank sender fields sent as null. */
export function toNotificationsInput(values: NotificationsForm, saved: NotificationsForm): NotificationsInput {
  const input: NotificationsInput = {};
  if (!same(values.email, saved.email)) {
    input.email = { fromName: values.email.fromName || null, replyTo: values.email.replyTo || null };
  }
  if (!same(values.customer, saved.customer)) input.customer = values.customer;
  if (!same(values.staff, saved.staff)) input.staff = values.staff;
  return input;
}
