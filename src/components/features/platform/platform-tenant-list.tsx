import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlatformTenant, PlatformTenantStatus } from "@/types/platform";

export const TENANT_STATUS_LABELS: Record<PlatformTenantStatus, string> = {
  active: "Active",
  draft: "Setting up",
  suspended: "Paused",
  archived: "Archived",
};
const dots: Record<PlatformTenantStatus, string> = {
  active: "bg-success",
  draft: "bg-info",
  suspended: "bg-warning",
  archived: "bg-muted-foreground",
};
export function PlatformTenantStatusBadge({ status }: { status: PlatformTenantStatus }) {
  return (
    <span className="bg-muted/60 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap">
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", dots[status])} />
      {TENANT_STATUS_LABELS[status]}
    </span>
  );
}

export function PlatformTenantList({ tenants }: { tenants: PlatformTenant[] }) {
  return (
    <div className="bg-card overflow-hidden rounded-2xl border">
      <div
        className="text-muted-foreground bg-muted/30 hidden grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_1fr_5rem_2rem] gap-4 border-b px-6 py-3 text-xs font-medium lg:grid"
        aria-hidden
      >
        <span>Turf business</span>
        <span>Owner</span>
        <span>Status</span>
        <span>Staff</span>
        <span />
      </div>
      <ul className="divide-y">
        {tenants.map((tenant) => (
          <li key={tenant.id}>
            <Link
              href={`/platform/tenants/${tenant.id}`}
              className="hover:bg-muted/40 focus-visible:bg-muted/50 focus-visible:ring-ring block px-4 py-5 outline-none focus-visible:ring-2 focus-visible:ring-inset sm:px-6"
              aria-label={`View ${tenant.name}`}
            >
              <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_1fr_5rem_2rem]">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="leading-snug font-semibold break-words">{tenant.name}</p>
                    <p className="text-muted-foreground mt-1 truncate text-xs">@{tenant.slug}</p>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium break-words">
                    {tenant.owner?.name ?? "Owner not assigned"}
                  </p>
                  <p className="text-muted-foreground mt-1 truncate text-xs">
                    {tenant.owner?.email ?? "Awaiting account setup"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 lg:contents">
                  <div>
                    <PlatformTenantStatusBadge status={tenant.status} />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {tenant.activeStaffCount}
                    <span className="ml-1 lg:hidden">active staff</span>
                  </p>
                  <ArrowUpRight className="text-muted-foreground h-4 w-4" aria-hidden />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
