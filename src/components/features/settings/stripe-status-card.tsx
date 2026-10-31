import { AlertTriangle, CheckCircle2, CreditCard, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatEventTime } from "@/lib/slot-format";
import { timeAgo } from "@/components/features/bookings/booking-status-helpers";
import { isWebhookQuiet, WEBHOOK_QUIET_DAYS } from "@/lib/payment-status";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/types/settings";
import { SettingsSection } from "./settings-section";

type Stripe = PaymentStatus["stripe"];

function StatusRow({ label, ok, children }: { label: string; ok: boolean; children: React.ReactNode }) {
  const Icon = ok ? CheckCircle2 : XCircle;
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex items-center gap-1.5 text-right text-sm">
        <Icon className={cn("h-4 w-4 shrink-0", ok ? "text-green-600" : "text-muted-foreground")} />
        {children}
      </div>
    </div>
  );
}

function LastEvent({ webhook }: { webhook: Stripe["webhook"] }) {
  if (!webhook.lastEventAt) return <span className="text-muted-foreground">No events received yet</span>;
  return (
    <span title={formatEventTime(webhook.lastEventAt)}>
      {timeAgo(webhook.lastEventAt)}
      {webhook.lastEventOk === false
        ? <span className="ml-1.5 text-destructive">· handling failed</span>
        : <span className="ml-1.5 text-muted-foreground">· handled OK</span>}
    </span>
  );
}

function QuietWarning({ stripe }: { stripe: Stripe }) {
  if (!isWebhookQuiet(stripe)) return null;
  return (
    <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      No Stripe webhook has arrived in the last {WEBHOOK_QUIET_DAYS} days. If customers paid by card in that time,
      check the webhook endpoint and STRIPE_WEBHOOK_SECRET; card bookings won&apos;t confirm without it.
    </p>
  );
}

/** Read-only Stripe status: keys, mode and webhook health. */
export function StripeStatusCard({ stripe }: { stripe: Stripe }) {
  const lastOk = !!stripe.webhook.lastEventAt && stripe.webhook.lastEventOk !== false;
  return (
    <SettingsSection title="Stripe" icon={CreditCard} description="Card payments on the booking website go through Stripe Checkout">
      <StatusRow label="Stripe keys" ok={stripe.configured}>
        {stripe.configured ? "Configured" : "Not configured"}
        {stripe.mode && (
          <Badge variant={stripe.mode === "live" ? "default" : "secondary"} className="ml-1.5 uppercase">
            {stripe.mode} mode
          </Badge>
        )}
      </StatusRow>
      <StatusRow label="Webhook" ok={stripe.webhook.configured}>
        {stripe.webhook.configured ? "Configured" : "Not configured"}
      </StatusRow>
      <StatusRow label="Last webhook event" ok={lastOk}>
        <LastEvent webhook={stripe.webhook} />
      </StatusRow>
      <QuietWarning stripe={stripe} />
      <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
        Keys are set in turf-api&apos;s <code className="font-mono">.env</code> (<code className="font-mono">STRIPE_SECRET_KEY</code>,{" "}
        <code className="font-mono">STRIPE_WEBHOOK_SECRET</code>) and never shown here. Test or live mode follows the key.
        Restart turf-api after changing them.
      </p>
    </SettingsSection>
  );
}
