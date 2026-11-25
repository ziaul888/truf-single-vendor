import { useWatch, type UseFormReturn } from "react-hook-form";
import { Loader2, RefreshCw, WalletCards } from "lucide-react";
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
    <div className="space-y-5 border-t pt-5">
      {methods.isPending ? (
        <p role="status" className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 aria-hidden className="size-4 motion-safe:animate-spin" /> Loading payment
          options…
        </p>
      ) : methods.isError ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 text-sm">
          <p>Payment options could not be loaded.</p>
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => methods.refetch()}
          >
            <RefreshCw aria-hidden /> Try again
          </Button>
        </div>
      ) : !methods.data || !available.length ? (
        <p className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
          Payment options will appear once the platform admin adds them.
        </p>
      ) : !plan ? (
        <p className="text-muted-foreground text-sm">Select a plan to see how to pay.</p>
      ) : (
        <PaymentFields
          form={form}
          available={available}
          instructions={methods.data}
          amount={formatBdt(planCharge(plan, interval))}
        />
      )}
      {errors.paymentMethod && (
        <p id="purchase-method-error" className="text-destructive text-sm">
          {errors.paymentMethod.message}
        </p>
      )}
      {isSubmitting && (
        <span className="sr-only" role="status">
          Submitting purchase…
        </span>
      )}
    </div>
  );
}

function PaymentFields({
  form,
  available,
  instructions,
  amount,
}: {
  form: UseFormReturn<PurchaseValues>;
  available: SubscriptionPaymentMethod[];
  instructions: SubscriptionPaymentInstructions;
  amount: string;
}) {
  const { errors, isSubmitting } = form.formState;
  const method = useWatch({ control: form.control, name: "paymentMethod" });
  return (
    <fieldset className="min-w-0 space-y-5" disabled={isSubmitting}>
      <legend className="sr-only">Payment details</legend>
      <div className="space-y-2">
        <p id="purchase-method-label" className="text-sm font-medium">
          Payment method
        </p>
        <div
          role="radiogroup"
          aria-labelledby="purchase-method-label"
          aria-describedby={errors.paymentMethod ? "purchase-method-error" : undefined}
          aria-invalid={!!errors.paymentMethod}
          className="flex flex-wrap gap-2"
        >
          {available.map((value) => (
            <label
              key={value}
              className="bg-muted/30 has-checked:border-primary/70 has-checked:bg-primary/5 has-focus-visible:outline-ring hover:border-primary/50 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-disabled:cursor-not-allowed"
            >
              <input
                type="radio"
                value={value}
                className="accent-primary size-4 shrink-0"
                {...form.register("paymentMethod")}
              />
              {subscriptionMethodLabels[value]}
            </label>
          ))}
        </div>
      </div>
      {method && instructions[method] && (
        <div className="bg-muted/45 space-y-2.5 rounded-xl border p-4">
          <p className="flex items-center gap-2 font-semibold">
            <WalletCards aria-hidden className="text-primary size-4 shrink-0" />
            {subscriptionMethodLabels[method]} instructions
          </p>
          <p className="text-sm leading-relaxed [overflow-wrap:anywhere] whitespace-pre-line">
            {instructions[method]}
          </p>
          <p className="text-muted-foreground text-sm">
            Send <strong className="text-foreground">{amount}</strong> and enter your transaction
            reference below.
          </p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="purchase-reference">Transaction reference</Label>
          <Input
            id="purchase-reference"
            maxLength={100}
            aria-invalid={!!errors.paymentReference}
            aria-describedby={errors.paymentReference ? "purchase-reference-error" : undefined}
            {...form.register("paymentReference")}
          />
          {errors.paymentReference && (
            <p id="purchase-reference-error" className="text-destructive text-sm">
              {errors.paymentReference.message}
            </p>
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <Label htmlFor="purchase-date">Payment date</Label>
          <Input
            id="purchase-date"
            type="date"
            max={billingTodayInput()}
            aria-invalid={!!errors.paymentDate}
            aria-describedby={errors.paymentDate ? "purchase-date-error" : undefined}
            {...form.register("paymentDate")}
          />
          {errors.paymentDate && (
            <p id="purchase-date-error" className="text-destructive text-sm">
              {errors.paymentDate.message}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
}
