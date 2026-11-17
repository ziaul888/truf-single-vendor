"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { usePlatformMe } from "@/hooks/usePlatform";
import { usePlatformPlans } from "@/hooks/usePlatformBilling";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatBdt } from "@/lib/platform-billing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlatformLoading, PlatformReadError } from "./platform-states";
import { BillingEmpty, BillingPagination } from "./billing-parts";
export function PlatformPlansView() {
  const me = usePlatformMe(),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1);
  const query = usePlatformPlans(me.data?.id, {
    page,
    limit: 12,
    search: useDebouncedValue(search.trim()) || undefined,
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription plans</h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Monthly and yearly software plans, priced in BDT.
          </p>
        </div>
        <Button asChild className="h-11">
          <Link href="/platform/plans/new">
            <Plus />
            Create plan
          </Link>
        </Button>
      </div>
      <div className="bg-card rounded-2xl border p-4">
        <Label className="sr-only" htmlFor="plan-search">
          Search plans
        </Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            id="plan-search"
            className="pl-10"
            placeholder="Search plan name or code"
            maxLength={100}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>
      {query.isError ? (
        <PlatformReadError error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data ? (
        <PlatformLoading label="Loading subscription plans" />
      ) : !query.data.data.length ? (
        <BillingEmpty
          title={search ? "No matching plans" : "Create your first plan"}
          description={
            search
              ? "Try a different plan name or code."
              : "Choose the monthly and yearly prices before assigning a subscription to a turf."
          }
          href={search ? undefined : "/platform/plans/new"}
          action="Create plan"
        />
      ) : (
        <>
          <p role="status" className="text-muted-foreground text-sm">
            {query.data.total} subscription {query.data.total === 1 ? "plan" : "plans"}
          </p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {query.data.data.map((plan) => (
              <article key={plan.id} className="bg-card min-w-0 rounded-2xl border p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold break-words">{plan.name}</h2>
                    <p className="text-muted-foreground mt-1 text-xs break-all">{plan.code}</p>
                  </div>
                  <span className="bg-success/10 shrink-0 rounded-full px-2 py-1 text-xs">
                    Available
                  </span>
                </div>
                {plan.description && (
                  <p className="text-muted-foreground mt-4 text-sm leading-relaxed break-words">
                    {plan.description}
                  </p>
                )}
                <dl className="mt-6 space-y-5">
                  <div>
                    <dt className="text-muted-foreground text-xs">Monthly</dt>
                    <dd className="mt-1 text-2xl font-bold break-words tabular-nums">
                      {formatBdt(plan.monthlyAmount)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Yearly</dt>
                    <dd className="mt-1 text-2xl font-bold break-words tabular-nums">
                      {formatBdt(plan.yearlyAmount)}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <BillingPagination
            page={page}
            total={query.data.total}
            busy={query.isFetching}
            onPage={setPage}
          />
        </>
      )}
    </div>
  );
}
