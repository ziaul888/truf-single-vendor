"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { usePlatformCommand, usePlatformPlans } from "@/hooks/usePlatformBilling";
import { billingTodayInput, formatBdt } from "@/lib/platform-billing";
import { toApiFailure } from "@/lib/api-error";
import type { BillingInterval, PlatformSubscription } from "@/types/platform-billing";
import { BillingError } from "./billing-parts";
import { PlatformLoading, PlatformReadError } from "./platform-states";

interface Values {
  planId: string;
  interval: BillingInterval;
  startDate: string;
  dueOn: string;
}
export function PlatformSubscriptionForm({
  userId,
  tenantId,
  close,
  setBusy,
}: {
  userId?: string;
  tenantId: string;
  close: () => void;
  setBusy: (value: boolean) => void;
}) {
  const plans = usePlatformPlans(userId),
    [values, setValues] = useState<Values>({
      planId: "",
      interval: "monthly",
      startDate: billingTodayInput(),
      dueOn: billingTodayInput(),
    }),
    [error, setError] = useState("");
  const command = usePlatformCommand<Values, PlatformSubscription>(
    userId,
    `/tenants/${tenantId}/subscription`
  );
  const plan = plans.data?.data.find((row) => row.id === values.planId);
  const isTrial = !!plan?.trialDays;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await command.mutateAsync(
        isTrial ? { ...values, interval: "monthly", dueOn: values.startDate } : values
      );
      close();
    } catch (err) {
      setError(toApiFailure(err).error);
    } finally {
      setBusy(false);
    }
  }
  if (plans.isError)
    return <PlatformReadError error={plans.error} onRetry={() => plans.refetch()} />;
  if (!plans.data) return <PlatformLoading label="Loading available plans" />;
  if (!plans.data.data.length)
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">Create a paid plan or a free trial first.</p>
        <Button asChild>
          <Link href="/platform/plans/new">Create plan</Link>
        </Button>
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset disabled={command.isPending} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="subscription-plan">Plan</Label>
          <Select
            value={values.planId}
            onValueChange={(planId) => setValues({ ...values, planId })}
          >
            <SelectTrigger id="subscription-plan">
              <SelectValue placeholder="Choose a plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.data.data
                .filter((row) => row.isActive)
                .map((row) => (
                  <SelectItem key={row.id} value={row.id}>
                    {row.name} ({row.code})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        {!isTrial && (
          <div className="space-y-2">
            <Label htmlFor="subscription-interval">Billing frequency</Label>
            <Select
              value={values.interval}
              onValueChange={(interval) =>
                setValues({ ...values, interval: interval === "yearly" ? "yearly" : "monthly" })
              }
            >
              <SelectTrigger id="subscription-interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {plan && (
          <p className="bg-muted rounded-xl p-3 text-sm">
            {isTrial ? (
              <strong>Free for {plan.trialDays} days</strong>
            ) : (
              <>
                <strong>
                  {formatBdt(
                    values.interval === "monthly" ? plan.monthlyAmount : plan.yearlyAmount
                  )}
                </strong>
                {` / ${values.interval === "monthly" ? "month" : "year"}`}
              </>
            )}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              { key: "startDate", label: "Subscription starts" },
              { key: "dueOn", label: "Payment due" },
            ] as const
          )
            .filter(({ key }) => !isTrial || key === "startDate")
            .map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`subscription-${key}`}>{label}</Label>
                <Input
                  id={`subscription-${key}`}
                  type="date"
                  min="2000-01-01"
                  max="2100-12-31"
                  required
                  value={values[key]}
                  onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                />
              </div>
            ))}
        </div>
      </fieldset>
      {!isTrial && (
        <p className="text-muted-foreground text-sm leading-relaxed">
          Creates the first unpaid invoice. The subscription is paid only after you verify and
          record the payment.
        </p>
      )}
      <BillingError message={error} />
      <Button className="h-11 w-full" disabled={!values.planId || command.isPending} type="submit">
        {command.isPending
          ? "Assigning…"
          : isTrial
            ? "Assign trial"
            : "Assign plan and create invoice"}
      </Button>
    </form>
  );
}
