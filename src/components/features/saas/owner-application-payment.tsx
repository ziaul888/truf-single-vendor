import { useWatch, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  billingTodayInput,
  formatBdt,
  planCharge,
  subscriptionMethodLabels,
} from "@/lib/platform-billing";
import type {
  BillingInterval,
  PlatformPlan,
  SubscriptionPaymentInstructions,
  SubscriptionPaymentMethod,
} from "@/types/platform-billing";
import type { PurchaseValues } from "./owner-application-form";

export function OwnerApplicationPayment({
  form,
  plan,
  interval,
  methods,
}: {
  form: UseFormReturn<PurchaseValues>;
  plan?: PlatformPlan;
  interval: BillingInterval;
  methods: {
    data?: SubscriptionPaymentInstructions;
    isPending: boolean;
    isError: boolean;
    refetch: () => unknown;
  };
}) {
  const available = (Object.keys(subscriptionMethodLabels) as SubscriptionPaymentMethod[]).filter(
    (method) => methods.data?.[method]
  );
  const { errors, isSubmitting } = form.formState;
  return (
    <section
      className="bg-card space-y-5 rounded-2xl border p-5 sm:p-7"
      aria-labelledby="payment-heading"
    >
      <div>
        <h2 id="payment-heading" className="text-lg font-semibold">
          First subscription payment
        </h2>
        {plan && (
          <p className="mt-2 text-xl font-bold">
            {formatBdt(planCharge(plan, interval))}
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              {plan.name} · {interval === "yearly" ? "one year" : "one month"}
            </span>
          </p>
        )}
      </div>
      {methods.isPending ? (
        <p role="status" className="text-muted-foreground">
          Loading payment options…
        </p>
      ) : methods.isError ? (
        <div role="alert" className="flex flex-wrap items-center gap-3">
          <p>Payment options could not be loaded.</p>
          <Button type="button" variant="outline" onClick={() => methods.refetch()}>
            Try again
          </Button>
        </div>
      ) : !methods.data || !available.length ? (
        <p className="text-muted-foreground">
          You can submit your application once the platform admin adds a payment option.
        </p>
      ) : !plan ? (
        <p className="text-muted-foreground">Select a plan to see how to pay.</p>
      ) : (
        <PaymentFields form={form} available={available} instructions={methods.data} />
      )}
      {errors.paymentMethod && (
        <p className="text-destructive text-sm">{errors.paymentMethod.message}</p>
      )}
      {isSubmitting && (
        <span className="sr-only" role="status">
          Submitting purchase…
        </span>
      )}
    </section>
  );
}

function PaymentFields({
  form,
  available,
  instructions,
}: {
  form: UseFormReturn<PurchaseValues>;
  available: SubscriptionPaymentMethod[];
  instructions: SubscriptionPaymentInstructions;
}) {
  const { errors, isSubmitting } = form.formState;
  const method = useWatch({ control: form.control, name: "paymentMethod" });
  return (
    <fieldset className="space-y-4" disabled={isSubmitting}>
      <legend className="sr-only">Payment details</legend>
      <div>
        <Label htmlFor="purchase-method">Payment method</Label>
        <select
          id="purchase-method"
          aria-invalid={!!errors.paymentMethod}
          {...form.register("paymentMethod")}
          className="border-input bg-background mt-2 h-11 w-full rounded-md border px-3 text-sm focus-visible:ring-2"
        >
          <option value="">Choose a method</option>
          {available.map((value) => (
            <option key={value} value={value}>
              {subscriptionMethodLabels[value]}
            </option>
          ))}
        </select>
      </div>
      {method && instructions[method] && (
        <div className="bg-muted/60 space-y-2 rounded-xl border p-4">
          <p className="font-semibold">{subscriptionMethodLabels[method]} instructions</p>
          <p className="break-words whitespace-pre-line">{instructions[method]}</p>
          <p className="text-muted-foreground text-sm">
            Send the full amount above and copy the reference from your completed transfer.
          </p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="purchase-reference">Transaction reference</Label>
          <Input
            id="purchase-reference"
            maxLength={100}
            aria-invalid={!!errors.paymentReference}
            {...form.register("paymentReference")}
          />
          {errors.paymentReference && (
            <p className="text-destructive text-sm">{errors.paymentReference.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchase-date">Payment date</Label>
          <Input
            id="purchase-date"
            type="date"
            max={billingTodayInput()}
            aria-invalid={!!errors.paymentDate}
            {...form.register("paymentDate")}
          />
          {errors.paymentDate && (
            <p className="text-destructive text-sm">{errors.paymentDate.message}</p>
          )}
        </div>
      </div>
    </fieldset>
  );
}
