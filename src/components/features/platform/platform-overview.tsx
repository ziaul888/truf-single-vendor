"use client";

import Link from "next/link";
import { Building2, CircleCheck, Clock3, CirclePause, ArrowRight, UsersRound } from "lucide-react";
import { usePlatformMe, usePlatformOverview } from "@/hooks/usePlatform";
import { Button } from "@/components/ui/button";
import { PlatformEmpty, PlatformLoading, PlatformReadError } from "./platform-states";
import { PlatformTenantList } from "./platform-tenant-list";

export function PlatformOverviewView() {
  const me = usePlatformMe(),
    overview = usePlatformOverview(me.data?.id);
  if (overview.isError)
    return <PlatformReadError error={overview.error} onRetry={() => overview.refetch()} />;
  if (!overview.data) return <PlatformLoading />;
  const { counts, recentTenants, owners } = overview.data;
  const stats = [
    {
      label: "Total turf businesses",
      value: counts.total,
      Icon: Building2,
      href: "/platform/tenants",
      description: "All registered turf accounts",
    },
    {
      label: "Active turfs",
      value: counts.active,
      Icon: CircleCheck,
      href: "/platform/tenants?status=active",
      description: "Accounts with active status",
    },
    {
      label: "Setting up",
      value: counts.draft,
      Icon: Clock3,
      href: "/platform/tenants?status=draft",
      description: "Accounts awaiting setup",
    },
    {
      label: "Paused turfs",
      value: counts.suspended,
      Icon: CirclePause,
      href: "/platform/tenants?status=suspended",
      description: "Accounts currently paused",
    },
  ];
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            SaaS administration
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Platform overview</h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed">
            An overview of your turf businesses, their status, and the people running them.
          </p>
        </div>
        <Button asChild className="h-11 rounded-xl">
          <Link href="/platform/tenants">
            View turf businesses
            <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, Icon, href, description }) => (
          <Link
            href={href}
            key={label}
            className="bg-card hover:border-primary/35 focus-visible:ring-ring rounded-2xl border p-5 transition-colors outline-none focus-visible:ring-2 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-muted-foreground text-sm leading-relaxed">{label}</p>
              <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-5 text-4xl font-bold tracking-tight tabular-nums">
              {value.toLocaleString()}
            </p>
            <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{description}</p>
          </Link>
        ))}
      </div>
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Recently added businesses</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              The latest turf accounts on your platform.
            </p>
          </div>
          <Button asChild variant="ghost" className="h-11">
            <Link href="/platform/tenants">
              View all
              <ArrowRight />
            </Link>
          </Button>
        </div>
        {recentTenants.length ? <PlatformTenantList tenants={recentTenants} /> : <PlatformEmpty />}
      </section>
      <div className="bg-card flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-xl">
            <UsersRound className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Turf owners</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Active owners linked to turf accounts
            </p>
          </div>
        </div>
        <p className="text-2xl font-bold tabular-nums">{owners.toLocaleString()}</p>
      </div>
    </div>
  );
}
