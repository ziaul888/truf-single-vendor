"use client";

import Link from "next/link";
import { ArrowLeft, Building2, UserRound, UsersRound } from "lucide-react";
import { usePlatformMe, usePlatformTenant } from "@/hooks/usePlatform";
import { PlatformLoading, PlatformReadError } from "./platform-states";
import { PlatformTenantStatusBadge } from "./platform-tenant-list";
import { PlatformTenantBilling, PlatformTenantActivity } from "./platform-tenant-billing";

export function PlatformTenantDetail({ id }: { id: string }) {
  const me = usePlatformMe(),
    tenant = usePlatformTenant(me.data?.id, id);
  const date = (value: string) =>
    new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
  return (
    <div className="space-y-6">
      <Link
        href="/platform/tenants"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium outline-none focus-visible:ring-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Turf businesses
      </Link>
      {tenant.isError ? (
        <PlatformReadError error={tenant.error} onRetry={() => tenant.refetch()} />
      ) : !tenant.data ? (
        <PlatformLoading label="Loading turf account" />
      ) : (
        <>
          <div className="flex items-start gap-4">
            <span className="bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
              <Building2 className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <p className="text-primary text-xs font-semibold tracking-widest uppercase">
                Turf account
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight break-words sm:text-3xl">
                {tenant.data.name}
              </h1>
              <div className="mt-3">
                <PlatformTenantStatusBadge status={tenant.data.status} />
              </div>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <section className="bg-card rounded-2xl border p-5 sm:p-7">
              <h2 className="text-lg font-semibold">Business details</h2>
              <dl className="mt-6 divide-y">
                {[
                  ["Handle", `@${tenant.data.slug}`],
                  ["Time zone", tenant.data.timezone.replaceAll("_", " ")],
                  ["Currency", tenant.data.currency.toUpperCase()],
                  ["Created", date(tenant.data.createdAt)],
                  ["Last updated", date(tenant.data.updatedAt)],
                ].map(([label, value]) => (
                  <div
                    className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    key={label}
                  >
                    <dt className="text-muted-foreground shrink-0 text-sm">{label}</dt>
                    <dd className="min-w-0 text-right text-sm font-medium break-words">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="bg-card rounded-2xl border p-5 sm:p-7">
              <h2 className="text-lg font-semibold">People and access</h2>
              <div className="mt-6 flex items-start gap-3">
                <UserRound className="text-primary mt-1 h-5 w-5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs">Business owner</p>
                  <p className="mt-1 font-semibold break-words">
                    {tenant.data.owner?.name ?? "Owner not assigned"}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm break-all">
                    {tenant.data.owner?.email ?? "No active owner membership"}
                  </p>
                  {tenant.data.owner && !tenant.data.owner.isActive && (
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                      Owner account not activated
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3 border-t pt-5">
                <UsersRound className="text-primary h-5 w-5" />
                <p className="text-sm">Active staff members</p>
                <p className="ml-auto text-xl font-bold tabular-nums">
                  {tenant.data.activeStaffCount}
                </p>
              </div>
            </section>
          </div>
          {tenant.data.status === "draft" && (
            <p className="bg-muted rounded-xl border p-4 text-sm leading-relaxed">
              This turf is being set up. Recording a subscription payment does not change the turf
              status.
            </p>
          )}
          <PlatformTenantBilling userId={me.data?.id} tenantId={id} />
          <PlatformTenantActivity userId={me.data?.id} tenantId={id} />
        </>
      )}
    </div>
  );
}
