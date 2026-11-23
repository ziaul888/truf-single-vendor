"use client";
import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Wallet } from "lucide-react";
import { toast } from "sonner";
import { usePlatformMe } from "@/hooks/usePlatform";
import { usePlatformCommand, usePlatformPlans } from "@/hooks/usePlatformBilling";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatBdt } from "@/lib/platform-billing";
import { cn } from "@/lib/utils";
import { toApiFailure } from "@/lib/api-error";
import type { PlatformPlan } from "@/types/platform-billing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlanFeaturesList } from "@/components/plan-features-list";
import { PlatformLoading, PlatformReadError } from "./platform-states";
import { BillingEmpty, BillingError, BillingPagination } from "./billing-parts";
import { BillingDialog } from "./platform-billing-dialog";

const PAGE_SIZE = 12;

export function PlatformPlansView() {
  const me = usePlatformMe(),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1);
  const query = usePlatformPlans(me.data?.id, {
    page,
    limit: PAGE_SIZE,
    search: useDebouncedValue(search.trim()) || undefined,
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription plans</h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Manage pricing and included features for paid plans and free trials.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="h-11">
            <Link href="/platform/settings/payments">
              <Wallet aria-hidden />
              Payment settings
            </Link>
          </Button>
          <Button asChild className="h-11">
            <Link href="/platform/plans/new">
              <Plus />
              Create plan
            </Link>
          </Button>
        </div>
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
              <article
                key={plan.id}
                className="bg-card flex min-w-0 flex-col rounded-2xl border p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold break-words">{plan.name}</h2>
                    <p className="text-muted-foreground mt-1 text-xs break-all">{plan.code}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-1 text-xs",
                      plan.isActive ? "bg-success/10" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {plan.isActive ? "Available" : "Archived"}
                  </span>
                </div>
                {plan.description && (
                  <p className="text-muted-foreground mt-4 text-sm leading-relaxed break-words">
                    {plan.description}
                  </p>
                )}
                {plan.trialDays ? (
                  <div className="mt-6 border-t pt-4">
                    <p className="text-muted-foreground text-xs">Free trial</p>
                    <p className="mt-1 text-2xl font-bold">{plan.trialDays} days</p>
                  </div>
                ) : (
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
                )}
                <PlanFeaturesList features={plan.features} className="mt-5 border-t pt-4" />
                {plan.isActive && (
                  <div className="mt-auto pt-5">
                    <PlanRemoval
                      plan={plan}
                      userId={me.data?.id}
                      onDeleted={() =>
                        setPage((current) =>
                          Math.min(
                            current,
                            Math.max(1, Math.ceil((query.data.total - 1) / PAGE_SIZE))
                          )
                        )
                      }
                    />
                  </div>
                )}
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

function PlanRemoval({
  plan,
  userId,
  onDeleted,
}: {
  plan: PlatformPlan;
  userId?: string;
  onDeleted: () => void;
}) {
  const cache = useQueryClient();
  const remove = usePlatformCommand<Record<string, never>, { status: "archived" | "deleted" }>(
    userId,
    `/plans/${encodeURIComponent(plan.id)}/remove`
  );

  async function confirm(close: () => void, setBusy: (busy: boolean) => void) {
    setBusy(true);
    try {
      const result = await remove.mutateAsync({});
      await cache.invalidateQueries({ queryKey: ["owner-application", "plans"] });
      close();
      if (result.status === "deleted") onDeleted();
      toast.success(result.status === "archived" ? "Plan archived" : "Plan deleted");
    } catch {
      // Display the error in the confirmation dialog.
    } finally {
      setBusy(false);
    }
  }

  return (
    <BillingDialog
      label="Delete plan"
      title={`Delete ${plan.name}?`}
      description="Unused plans are permanently deleted. Plans with application or subscription history are archived and taken off sale. Existing applications and subscriptions keep their plan details."
    >
      {(close, setBusy) => (
        <div className="space-y-4">
          {remove.isError && <BillingError message={toApiFailure(remove.error).error} />}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              className="h-11"
              disabled={remove.isPending}
              onClick={() => {
                remove.reset();
                close();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="h-11"
              disabled={remove.isPending}
              onClick={() => void confirm(close, setBusy)}
            >
              {remove.isPending ? "Removing…" : "Delete plan"}
            </Button>
          </div>
        </div>
      )}
    </BillingDialog>
  );
}
