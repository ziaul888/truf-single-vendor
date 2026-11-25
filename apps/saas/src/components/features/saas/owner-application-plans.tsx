"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatBdt, planCharge } from "@/lib/platform-billing";
import { cn } from "@/lib/utils";
import type { ApiSuccess } from "@/types/api";
import type {
  BillingInterval,
  PlatformPlan,
  SubscriptionPaymentInstructions,
} from "@/types/platform-billing";

export function useOwnerApplicationPlans() {
  return usePublicPurchaseQuery<PlatformPlan[]>("plans");
}

export function useSubscriptionPaymentMethods(enabled: boolean) {
  return usePublicPurchaseQuery<SubscriptionPaymentInstructions>("payment-methods", enabled);
}

function usePublicPurchaseQuery<T>(resource: "plans" | "payment-methods", enabled = true) {
  return useQuery({
    queryKey: ["owner-application", resource],
    enabled,
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/v1/owner-applications/${resource}`, {
        signal,
        cache: "no-store",
      });
      const body = (await response.json()) as ApiSuccess<T> | { error?: string };
      if (!response.ok || !("success" in body) || !body.success)
        throw new Error(
          "error" in body && body.error ? body.error : "Could not load purchase options"
        );
      return body.data;
    },
  });
}

export function BillingCycleToggle({
  interval,
  onInterval,
  disabled,
}: {
  interval: BillingInterval;
  onInterval: (interval: BillingInterval) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="bg-muted grid w-full max-w-xs grid-cols-2 gap-1 rounded-xl p-1"
      role="group"
      aria-label="Billing cycle"
    >
      {(["monthly", "yearly"] as const).map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={interval === value}
          disabled={disabled}
          className={cn(
            "focus-visible:ring-ring min-h-11 rounded-lg px-3 text-sm font-medium capitalize focus-visible:ring-2 focus-visible:outline-none",
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
  );
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
  const [showAllPlans, setShowAllPlans] = useState(false);
  const selectedPlan = plans?.find((plan) => plan.id === planId);
  const visiblePlans = selectedPlan && !showAllPlans ? [selectedPlan] : (plans ?? []);
  return (
    <section
      className="bg-card min-w-0 space-y-4 rounded-2xl border p-5 shadow-xs sm:p-6"
      aria-labelledby="application-plan"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 id="application-plan" className="saas-title mr-auto">
          Subscription plan
        </h2>
        {selectedPlan && plans && plans.length > 1 && (
          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0"
            disabled={disabled}
            onClick={() => setShowAllPlans((value) => !value)}
            aria-expanded={showAllPlans}
            aria-controls="application-plan-options"
          >
            {showAllPlans ? "Close plans" : "Change plan"}
          </Button>
        )}
        {(!plans?.length || visiblePlans.some((plan) => !plan.trialDays)) && (
          <div className="w-full sm:w-auto">
            <BillingCycleToggle interval={interval} onInterval={onInterval} disabled={disabled} />
          </div>
        )}
      </div>
      {loading ? (
        <div
          role="status"
          className="text-muted-foreground flex min-h-24 items-center justify-center gap-2 rounded-xl border border-dashed text-sm"
        >
          <Loader2 aria-hidden className="size-4 motion-safe:animate-spin" /> Loading plans…
        </div>
      ) : loadError ? (
        <div role="alert" className="space-y-3 rounded-xl border border-dashed p-4">
          <p className="text-destructive text-sm">Could not load subscription plans.</p>
          <Button type="button" variant="outline" className="h-11" onClick={onRetry}>
            <RefreshCw aria-hidden /> Try again
          </Button>
        </div>
      ) : !plans?.length ? (
        <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
          No subscription plans are available right now.
        </p>
      ) : (
        <div
          id="application-plan-options"
          className={cn("grid gap-3", visiblePlans.length > 1 && "sm:grid-cols-2")}
        >
          {visiblePlans.map((plan) => {
            const selected = plan.id === planId;
            const amount = planCharge(plan, interval);
            return (
              <button
                key={plan.id}
                type="button"
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => {
                  onPlan(plan.id);
                  setShowAllPlans(false);
                }}
                className={cn(
                  "focus-visible:ring-ring flex min-w-0 items-start rounded-xl border p-4 text-left transition-colors outline-none focus-visible:ring-2",
                  selected
                    ? "border-primary/70 bg-primary/5"
                    : "bg-muted/25 hover:border-primary/50"
                )}
              >
                <span className="flex w-full items-start gap-2.5">
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/50"
                    )}
                  >
                    {selected && <Check className="size-3" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold [overflow-wrap:anywhere]">
                      {plan.name}
                    </span>
                    {plan.description && (
                      <span className="text-muted-foreground mt-1 block text-sm leading-relaxed [overflow-wrap:anywhere]">
                        {plan.description}
                      </span>
                    )}
                    <span className="mt-2 flex flex-wrap items-baseline gap-x-1.5">
                      <span className="saas-numeral text-lg">
                        {plan.trialDays ? "Free" : formatBdt(amount)}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {plan.trialDays
                          ? `for ${plan.trialDays} days`
                          : `/ ${interval === "monthly" ? "month" : "year"}`}
                      </span>
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </section>
  );
}
