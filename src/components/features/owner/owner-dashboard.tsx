"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, LogOut } from "lucide-react";
import { useOwnerMe, useOwnerBilling } from "@/hooks/useOwner";
import { ownerApi } from "@/lib/owner-api";
import { toApiFailure } from "@/lib/api-error";
import { formatBdt, displayBillingDate } from "@/lib/platform-billing";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BillingError, BillingStatus } from "../platform/billing-parts";
import { PlatformLoading } from "../platform/platform-states";
const turfStatuses: Record<string, string> = {
  draft: "Setting up",
  active: "Active",
  suspended: "Paused",
  archived: "Archived",
};
export function OwnerDashboard() {
  const me = useOwnerMe(),
    cache = useQueryClient(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function logout() {
    setError("");
    setBusy(true);
    try {
      await ownerApi.post("/auth/logout");
      await cache.cancelQueries();
      cache.clear();
      window.location.assign("/owner/login");
    } catch (err) {
      setError(toApiFailure(err).error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <header className="bg-card sticky top-0 z-30 border-b pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex min-h-18 max-w-5xl items-center justify-between gap-3 px-4 sm:px-7">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Turf owner</p>
            <p className="text-muted-foreground truncate text-xs">
              {me.data?.name ?? "Your account"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 [&_button]:h-11">
            <ThemeToggle />
            <Button
              aria-label="Sign out of owner account"
              variant="ghost"
              disabled={busy}
              onClick={logout}
            >
              <LogOut />
              <span className="hidden sm:inline">{busy ? "Signing out…" : "Sign out"}</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-7 sm:px-7 sm:py-10">
        <BillingError message={error} />
        {me.isError ? (
          <OwnerLoadError error={me.error} retry={() => me.refetch()} />
        ) : !me.data ? (
          <PlatformLoading label="Loading your turf account" />
        ) : (
          <>
            <div className="flex items-start gap-4">
              <span className="bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
                <Building2 className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <p className="text-primary text-xs font-semibold tracking-widest uppercase">
                  Your turf
                </p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight break-words sm:text-3xl">
                  {me.data.tenant.name}
                </h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  {turfStatuses[me.data.tenant.status]}
                </p>
              </div>
            </div>
            <p className="bg-muted rounded-xl border p-4 text-sm leading-relaxed">
              Your owner account is active. You can review your account and subscription here.
              Booking management will be available after turf setup is complete.
            </p>
            <section className="bg-card rounded-2xl border p-5 sm:p-7">
              <h2 className="text-lg font-semibold">Account details</h2>
              <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
                {[
                  ["Owner", me.data.name],
                  ["Email", me.data.email],
                  ["Turf handle", `@${me.data.tenant.slug}`],
                  ["Time zone", me.data.tenant.timezone.replaceAll("_", " ")],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="mt-1 font-medium break-words">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <OwnerBillingPanel userId={me.data.id} />
          </>
        )}
      </main>
    </div>
  );
}
function OwnerLoadError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <section className="bg-card space-y-4 rounded-2xl border p-5 sm:p-7">
      <BillingError message={toApiFailure(error).error} />
      <Button variant="outline" className="h-11" onClick={retry}>
        Try again
      </Button>
    </section>
  );
}
function OwnerBillingPanel({ userId }: { userId: string }) {
  const query = useOwnerBilling(userId),
    sub = query.data?.subscription;
  if (query.isError) return <OwnerLoadError error={query.error} retry={() => query.refetch()} />;
  if (!query.data) return <PlatformLoading label="Loading your subscription billing" />;
  return (
    <section className="bg-card space-y-6 rounded-2xl border p-5 sm:p-7">
      <h2 className="text-lg font-semibold">Subscription and billing</h2>
      {sub ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xl font-semibold break-words">{sub.planName}</p>
              <p className="text-muted-foreground mt-2 text-sm">
                {formatBdt(sub.amount)} / {sub.interval === "monthly" ? "month" : "year"}
              </p>
            </div>
            <BillingStatus status={sub.status} />
          </div>
          <p className="text-muted-foreground text-sm">
            {sub.paidThrough
              ? `Paid until ${displayBillingDate(sub.paidThrough)}`
              : "No subscription payment recorded yet."}
            {sub.cancelAtPeriodEnd ? " · Renewal cancelled" : ""}
          </p>
        </>
      ) : (
        <p className="text-muted-foreground text-sm">
          Your platform administrator will assign your subscription plan.
        </p>
      )}
      <div className="border-t pt-5">
        <h3 className="font-semibold">Recent invoices</h3>
        {query.data.invoices.length ? (
          <ul className="mt-3 divide-y">
            {query.data.invoices.map((invoice) => (
              <li
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold break-all">{invoice.number}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatBdt(invoice.amount)} · Due {displayBillingDate(invoice.dueOn)}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {displayBillingDate(invoice.periodStart)} –{" "}
                    {displayBillingDate(invoice.periodEnd)}
                  </p>
                </div>
                <BillingStatus status={invoice.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">No invoices yet.</p>
        )}
      </div>
      <p className="text-muted-foreground border-t pt-4 text-sm leading-relaxed">
        Contact your platform administrator for payment details. They will verify your manual
        payment and update the invoice.
      </p>
    </section>
  );
}
