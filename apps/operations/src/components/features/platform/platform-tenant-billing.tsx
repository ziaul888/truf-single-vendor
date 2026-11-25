"use client";
import Link from "next/link";
import { useTenantActivity, useTenantBilling } from "@/hooks/usePlatformBilling";
import { displayBillingDate, formatBdt } from "@/lib/platform-billing";
import { Button } from "@/components/ui/button";
import { BillingDialog } from "./platform-billing-dialog";
import { BillingStatus } from "./billing-parts";
import { PlatformSubscriptionForm } from "./platform-subscription-form";
import { PlatformCancellationForm, PlatformRenewalForm } from "./platform-renewal-form";
import { PlatformLoading, PlatformReadError } from "./platform-states";

export function PlatformTenantBilling({ userId, tenantId }: { userId?: string; tenantId: string }) {
  const query = useTenantBilling(userId, tenantId),
    sub = query.data?.subscription;
  if (query.isError)
    return <PlatformReadError error={query.error} onRetry={() => query.refetch()} />;
  if (!query.data) return <PlatformLoading label="Loading turf billing" />;
  return (
    <section className="bg-card space-y-6 rounded-2xl border p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Subscription and billing</h2>
        {(!sub || sub.status === "cancelled" || sub.status === "trial_ended") && (
          <BillingDialog
            label="Assign plan"
            title="Assign a subscription"
            description="Choose a plan and start date for this turf."
            variant="default"
          >
            {(close, setBusy) => (
              <PlatformSubscriptionForm
                userId={userId}
                tenantId={tenantId}
                close={close}
                setBusy={setBusy}
              />
            )}
          </BillingDialog>
        )}
      </div>
      {sub ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xl font-semibold break-words">{sub.planName}</p>
              <p className="text-muted-foreground mt-2 text-sm">
                {sub.trialEndsOn
                  ? "Free trial"
                  : `${formatBdt(sub.amount)} / ${sub.interval === "monthly" ? "month" : "year"}`}
              </p>
            </div>
            <BillingStatus status={sub.status} />
          </div>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Started</dt>
              <dd className="mt-1 font-medium">{displayBillingDate(sub.startDate)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">
                {sub.trialEndsOn ? "Trial ends" : "Paid until"}
              </dt>
              <dd className="mt-1 font-medium">
                {sub.trialEndsOn
                  ? displayBillingDate(sub.trialEndsOn)
                  : sub.paidThrough
                    ? displayBillingDate(sub.paidThrough)
                    : "No payment recorded"}
              </dd>
            </div>
          </dl>
          {sub.cancelAtPeriodEnd && (
            <p className="bg-muted rounded-xl p-3 text-sm leading-relaxed">
              Renewal cancelled.{" "}
              {sub.paidThrough && sub.status !== "cancelled"
                ? `Paid access ends on ${displayBillingDate(sub.paidThrough)}.`
                : "This subscription has ended."}
              {sub.cancelReason && (
                <span className="mt-1 block break-words">Reason: {sub.cancelReason}</span>
              )}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {sub.canRenew && (
              <BillingDialog
                label="Create renewal invoice"
                title="Create renewal invoice"
                description="The next period uses this subscription’s agreed price."
              >
                {(close, setBusy) => (
                  <PlatformRenewalForm
                    userId={userId}
                    subscription={sub}
                    close={close}
                    setBusy={setBusy}
                  />
                )}
              </BillingDialog>
            )}
            {!sub.cancelAtPeriodEnd &&
              sub.status !== "cancelled" &&
              sub.status !== "trial_ended" && (
                <BillingDialog
                  label={sub.trialEndsOn ? "End trial" : "Cancel renewal"}
                  title={sub.trialEndsOn ? "End this free trial" : "Cancel subscription renewal"}
                  description={
                    sub.trialEndsOn
                      ? "End the trial to assign a paid plan."
                      : "Stop future billing and preserve any paid period."
                  }
                >
                  {(close, setBusy) => (
                    <PlatformCancellationForm
                      userId={userId}
                      subscription={sub}
                      close={close}
                      setBusy={setBusy}
                    />
                  )}
                </BillingDialog>
              )}
          </div>
        </>
      ) : (
        <p className="text-muted-foreground text-sm">
          No subscription assigned. Create a plan, then assign it to this turf.
        </p>
      )}
      <div className="border-t pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Recent invoices</h3>
          <Button variant="link" asChild className="h-11 px-0">
            <Link href={`/platform/invoices?tenantId=${tenantId}`}>View all invoices</Link>
          </Button>
        </div>
        {query.data.recentInvoices.length ? (
          <ul className="divide-y">
            {query.data.recentInvoices.map((invoice) => (
              <li key={invoice.id}>
                <Link
                  href={`/platform/invoices/${invoice.id}`}
                  className="hover:bg-muted/40 focus-visible:ring-ring flex flex-wrap items-center justify-between gap-3 rounded-lg py-4 outline-none focus-visible:ring-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold break-all">{invoice.number}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Due {displayBillingDate(invoice.dueOn)} · {formatBdt(invoice.amount)}
                    </p>
                  </div>
                  <BillingStatus status={invoice.status} />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground py-4 text-sm">No invoices yet.</p>
        )}
      </div>
    </section>
  );
}
const activityLabels: Record<string, string> = {
  owner_invited: "Owner activation link created",
  owner_activated: "Owner account activated",
  tenant_created: "Turf account created",
  subscription_created: "Subscription assigned",
  invoice_issued: "Renewal invoice created",
  subscription_cancelled: "Subscription renewal cancelled",
  invoice_paid: "Payment recorded",
};
export function PlatformTenantActivity({
  userId,
  tenantId,
}: {
  userId?: string;
  tenantId: string;
}) {
  const query = useTenantActivity(userId, tenantId);
  if (query.isError)
    return <PlatformReadError error={query.error} onRetry={() => query.refetch()} />;
  if (!query.data) return <PlatformLoading label="Loading account activity" />;
  return (
    <section className="bg-card rounded-2xl border p-5 sm:p-7">
      <h2 className="text-lg font-semibold">Recent activity</h2>
      {query.data.data.length ? (
        <ul className="mt-4 divide-y">
          {query.data.data.map((event) => (
            <li key={event.id} className="py-4 text-sm">
              <p className="font-medium">
                {activityLabels[event.action] ?? event.action.replaceAll("_", " ")}
              </p>
              <p className="text-muted-foreground mt-1 break-words">
                {event.actor.name} ·{" "}
                {new Intl.DateTimeFormat("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Dhaka",
                }).format(new Date(event.createdAt))}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-4 text-sm">No account activity recorded yet.</p>
      )}
    </section>
  );
}
