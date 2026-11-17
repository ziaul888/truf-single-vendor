"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import { usePlatformMe, usePlatformTenants } from "@/hooks/usePlatform";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { PLATFORM_TENANT_STATUSES, type PlatformTenantStatus } from "@/types/platform";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PlatformEmpty, PlatformLoading, PlatformReadError } from "./platform-states";
import { PlatformTenantList, TENANT_STATUS_LABELS } from "./platform-tenant-list";

const LIMIT = 12;
export function PlatformTenantDirectory({
  initialStatus,
}: {
  initialStatus?: PlatformTenantStatus;
}) {
  const me = usePlatformMe();
  const [filters, setFilters] = useState({ search: "", status: initialStatus ?? "all", page: 1 });
  const search = useDebouncedValue(filters.search.trim());
  const status = PLATFORM_TENANT_STATUSES.find((value) => value === filters.status);
  const tenants = usePlatformTenants(me.data?.id, {
    page: filters.page,
    limit: LIMIT,
    status,
    search: search || undefined,
  });
  const filtered = !!filters.search || filters.status !== "all";
  const clear = () => setFilters({ search: "", status: "all", page: 1 });
  const pages = Math.max(1, Math.ceil((tenants.data?.total ?? 0) / LIMIT));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            Manage platform
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Turf businesses</h1>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Find a turf account and review its owner, status, and account information.
          </p>
        </div>
        <Button asChild className="h-11">
          <Link href="/platform/tenants/new">
            <Plus />
            Add turf
          </Link>
        </Button>
      </div>
      <div className="bg-card flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center sm:p-4">
        <div className="relative min-w-0 flex-1">
          <Label htmlFor="platform-search" className="sr-only">
            Search turf businesses
          </Label>
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            id="platform-search"
            className="pl-10"
            placeholder="Search by turf name or handle"
            maxLength={100}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
        <div className="w-full sm:w-44">
          <Label htmlFor="platform-status" className="sr-only">
            Business status
          </Label>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters({ ...filters, status: value, page: 1 })}
          >
            <SelectTrigger id="platform-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {PLATFORM_TENANT_STATUSES.map((value) => (
                <SelectItem value={value} key={value}>
                  {TENANT_STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {filtered && (
          <Button variant="ghost" className="h-11" onClick={clear}>
            <X />
            Clear filters
          </Button>
        )}
      </div>
      {tenants.isError ? (
        <PlatformReadError error={tenants.error} onRetry={() => tenants.refetch()} />
      ) : !tenants.data ? (
        <PlatformLoading label="Loading turf businesses" />
      ) : !tenants.data.data.length ? (
        <PlatformEmpty filtered={filtered} />
      ) : (
        <>
          <p className="text-muted-foreground text-sm" role="status">
            {tenants.data.total} turf {tenants.data.total === 1 ? "business" : "businesses"}
            {filtered ? " found" : " registered"}
          </p>
          <PlatformTenantList tenants={tenants.data.data} />
          {pages > 1 && (
            <nav
              aria-label="Turf business pages"
              className="flex items-center justify-between gap-2 border-t pt-5"
            >
              <Button
                variant="outline"
                className="h-11"
                disabled={filters.page === 1 || tenants.isFetching}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              >
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {filters.page} of {pages}
              </span>
              <Button
                variant="outline"
                className="h-11"
                disabled={filters.page >= pages || tenants.isFetching}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
