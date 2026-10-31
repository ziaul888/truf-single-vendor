import type { PaymentStatus } from "@/types/settings";

/** Warn when Stripe is set up but no signed webhook has arrived for this long. */
export const WEBHOOK_QUIET_DAYS = 7;

/** True when Stripe is configured but the webhook has never fired, or not within WEBHOOK_QUIET_DAYS. */
export function isWebhookQuiet({ configured, webhook }: PaymentStatus["stripe"], now = Date.now()): boolean {
  if (!configured) return false;
  if (!webhook.lastEventAt) return true;
  return now - new Date(webhook.lastEventAt).getTime() > WEBHOOK_QUIET_DAYS * 24 * 60 * 60 * 1000;
}
