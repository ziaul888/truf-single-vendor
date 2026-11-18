"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBdt } from "@/lib/platform-billing";
import { cn } from "@/lib/utils";
import type { ApiSuccess } from "@/types/api";
import type { BillingInterval, PlatformPlan } from "@/types/platform-billing";

export function useOwnerApplicationPlans() {
  return useQuery({
    queryKey: ["owner-application-plans"],
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/v1/owner-applications/plans", { signal });
      const body = (await response.json()) as ApiSuccess<PlatformPlan[]> | { error?: string };
      if (!response.ok || !("success" in body) || !body.success)
        throw new Error("error" in body && body.error ? body.error : "Could not load plans");
      return body.data;
    },
  });
}

export function OwnerApplicationPlans({
  plans,
  planId,
  interval,
  disabled,
  error,
  loading,
  loadError,
  onPlan,
  onInterval,
  onRetry,
}: {
  plans?: PlatformPlan[];
  planId: string;
  interval: BillingInterval;
  disabled: boolean;
  error?: string;
  loading: boolean;
  loadError: boolean;
  onPlan: (value: string) => void;
  onInterval: (value: BillingInterval) => void;
  onRetry: () => void;
}) {
  return (
    <section className="bg-card space-y-5 rounded-2xl border p-5 sm:p-7">
      <div>
        <h2 className="text-lg font-semibold">Choose your plan</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          A plan is required before you can apply. Payment is confirmed manually after approval.
        </p>
      </div>
      <div className="bg-muted grid grid-cols-2 gap-1 rounded-xl p-1" role="radiogroup">
        {(["monthly", "yearly"] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={interval === value}
            disabled={disabled}
            className={cn(
              "focus-visible:ring-ring min-h-10 rounded-lg px-3 text-sm font-medium capitalize outline-none focus-visible:ring-2",
              interval === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => onInterval(value)}
          >
            {value}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="text-muted-foreground flex min-h-28 items-center justify-center gap-2 rounded-xl border border-dashed text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading plans…
        </div>
      ) : loadError ? (
        <div className="space-y-3 rounded-xl border border-dashed p-4 text-center">
          <p className="text-destructive text-sm">Could not load subscription plans.</p>
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw /> Try again
          </Button>
        </div>
      ) : !plans?.length ? (
        <p className="text-muted-foreground rounded-xl border border-dashed p-5 text-center text-sm">
          No plans are available right now. Please contact support.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {plans.map((plan) => {
            const selected = plan.id === planId;
            const amount = interval === "monthly" ? plan.monthlyAmount : plan.yearlyAmount;
            return (
              <button
                key={plan.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled}
                onClick={() => onPlan(plan.id)}
                className={cn(
                  "focus-visible:ring-ring relative rounded-2xl border p-4 text-left transition outline-none focus-visible:ring-2",
                  selected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                )}
              >
                {selected && (
                  <span className="bg-primary text-primary-foreground absolute top-3 right-3 rounded-full p-1">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
                <p className="pr-8 font-semibold">{plan.name}</p>
                {plan.description && (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                    {plan.description}
                  </p>
                )}
                <p className="mt-4 text-xl font-bold">{formatBdt(amount)}</p>
                <p className="text-muted-foreground text-xs">
                  per {interval === "monthly" ? "month" : "year"}
                </p>
              </button>
            );
          })}
        </div>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </section>
  );
}
