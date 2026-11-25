"use client";
import Link from "next/link";
import { useState } from "react";
import { usePlatformMe } from "@/hooks/usePlatform";
import { usePlatformInvoices, usePlatformSubscriptions } from "@/hooks/usePlatformBilling";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { displayBillingDate, formatBdt } from "@/lib/platform-billing";
import type {
  BillingFilters,
  PlatformInvoice,
  PlatformSubscription,
} from "@/types/platform-billing";
import { PlatformLoading, PlatformReadError } from "./platform-states";
import { BillingEmpty, BillingPagination, BillingStatus } from "./billing-parts";
import { PlatformBillingFilters } from "./platform-billing-filters";
const invoiceStatuses = { issued: "Unpaid", overdue: "Overdue", paid: "Paid", void: "Voided" };
const subscriptionStatuses = {
  pending: "Awaiting payment",
  scheduled: "Scheduled",
  active: "Active",
  trialing: "On trial",
  trial_ended: "Trial ended",
  past_due: "Past due",
  cancelled: "Cancelled",
};
export function PlatformBillingDirectory({
  kind,
  initialTenantId,
}: {
  kind: "invoices" | "subscriptions";
  initialTenantId?: string;
}) {
  const me = usePlatformMe(),
    [filters, setFilters] = useState({
      page: 1,
      search: "",
      status: "all",
      tenantId: initialTenantId,
    });
  const params: BillingFilters = {
    ...filters,
    limit: 12,
    search: useDebouncedValue(filters.search.trim()) || undefined,
    status: filters.status === "all" ? undefined : filters.status,
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {kind === "invoices" ? "Subscription invoices" : "Subscriptions"}
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          {kind === "invoices"
            ? "Review software invoices and record verified manual payments."
            : "Review each turf’s plan, payment status and renewal dates."}
        </p>
      </div>
      <PlatformBillingFilters
        search={filters.search}
        status={filters.status}
        statuses={kind === "invoices" ? invoiceStatuses : subscriptionStatuses}
        tenantId={filters.tenantId}
        onSearch={(search) => setFilters({ ...filters, search, page: 1 })}
        onStatus={(status) => setFilters({ ...filters, status, page: 1 })}
        onClearTenant={() => setFilters({ ...filters, tenantId: undefined, page: 1 })}
      />
      {kind === "invoices" ? (
        <InvoiceResults
          userId={me.data?.id}
          filters={params}
          onPage={(page) => setFilters({ ...filters, page })}
        />
      ) : (
        <SubscriptionResults
          userId={me.data?.id}
          filters={params}
          onPage={(page) => setFilters({ ...filters, page })}
        />
      )}
    </div>
  );
}
interface Props {
  userId?: string;
  filters: BillingFilters;
  onPage: (page: number) => void;
}
function InvoiceResults({ userId, filters, onPage }: Props) {
  const query = usePlatformInvoices(userId, filters);
  if (query.isError)
    return <PlatformReadError error={query.error} onRetry={() => query.refetch()} />;
  if (!query.data) return <PlatformLoading label="Loading invoices" />;
  return (
    <>
      {!query.data.data.length ? (
        <BillingEmpty
          title="No invoices found"
          description="Assign a plan to a turf to create its first invoice, or adjust your filters."
          href="/platform/tenants"
          action="Turf businesses"
        />
      ) : (
        <>
          <p className="text-muted-foreground text-sm" role="status">
            {query.data.total} invoices
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {query.data.data.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        </>
      )}
      <BillingPagination
        page={filters.page}
        total={query.data.total}
        busy={query.isFetching}
        onPage={onPage}
      />
    </>
  );
}
function InvoiceCard({ invoice }: { invoice: PlatformInvoice }) {
  return (
    <Link
      href={`/platform/invoices/${invoice.id}`}
      className="bg-card hover:border-primary/40 focus-visible:ring-ring min-w-0 space-y-4 rounded-2xl border p-5 outline-none focus-visible:ring-2"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm font-semibold break-all">{invoice.number}</p>
        <BillingStatus status={invoice.status} />
      </div>
      <div>
        <p className="font-semibold break-words">{invoice.tenant.name}</p>
        <p className="text-muted-foreground mt-1 text-sm break-words">
          {invoice.planName} · {invoice.interval}
        </p>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3 border-t pt-4">
        <p className="text-xl font-bold tabular-nums">{formatBdt(invoice.amount)}</p>
        <p className="text-muted-foreground text-xs">Due {displayBillingDate(invoice.dueOn)}</p>
      </div>
    </Link>
  );
}
function SubscriptionResults({ userId, filters, onPage }: Props) {
  const query = usePlatformSubscriptions(userId, filters);
  if (query.isError)
    return <PlatformReadError error={query.error} onRetry={() => query.refetch()} />;
  if (!query.data) return <PlatformLoading label="Loading subscriptions" />;
  return (
    <>
      {!query.data.data.length ? (
        <BillingEmpty
          title="No subscriptions found"
          description="Open a turf account to assign its plan, or adjust your filters."
          href="/platform/tenants"
          action="Turf businesses"
        />
      ) : (
        <>
          <p className="text-muted-foreground text-sm" role="status">
            {query.data.total} subscriptions
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {query.data.data.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} />
            ))}
          </div>
        </>
      )}
      <BillingPagination
        page={filters.page}
        total={query.data.total}
        busy={query.isFetching}
        onPage={onPage}
      />
    </>
  );
}
function SubscriptionCard({ subscription: sub }: { subscription: PlatformSubscription }) {
  return (
    <Link
      href={`/platform/tenants/${sub.tenantId}`}
      className="bg-card hover:border-primary/40 focus-visible:ring-ring min-w-0 space-y-4 rounded-2xl border p-5 outline-none focus-visible:ring-2"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="font-semibold break-words">{sub.tenant.name}</h2>
        <BillingStatus status={sub.status} />
      </div>
      <p className="text-muted-foreground text-sm break-words">
        {sub.planName} · {sub.trialEndsOn ? "Trial" : sub.interval}
      </p>
      <p className="text-xl font-bold tabular-nums">
        {sub.trialEndsOn ? "Free" : formatBdt(sub.amount)}
      </p>
      <p className="text-muted-foreground border-t pt-4 text-xs">
        {sub.trialEndsOn
          ? `Trial ends ${displayBillingDate(sub.trialEndsOn)}`
          : sub.paidThrough
            ? `Paid until ${displayBillingDate(sub.paidThrough)}`
            : "No payment recorded"}
        {sub.cancelAtPeriodEnd ? " · Renewal cancelled" : ""}
      </p>
    </Link>
  );
}
