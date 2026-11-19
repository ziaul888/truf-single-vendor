"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, RefreshCw } from "lucide-react";
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

export function useSubscriptionPaymentMethods() {
  return usePublicPurchaseQuery<SubscriptionPaymentInstructions>("payment-methods");
}

function usePublicPurchaseQuery<T>(resource: "plans" | "payment-methods") {
  return useQuery({
    queryKey: ["owner-application", resource],
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
  return (
    <section className="bg-card space-y-5 rounded-2xl border p-5 sm:p-7">
      <div>
        <h2 className="text-lg font-semibold">Choose your plan</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Choose a billing cycle. The full first payment is due before activation.
        </p>
      </div>
      <BillingCycleToggle interval={interval} onInterval={onInterval} disabled={disabled} />
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
            const amount = planCharge(plan, interval);
            return (
              <button
                key={plan.id}
                type="button"
                aria-pressed={selected}
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
