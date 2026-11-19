"use client";

import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePlatformCommand, usePlatformPaymentMethods } from "@/hooks/usePlatformBilling";
import { toApiFailure } from "@/lib/api-error";
import { subscriptionMethodLabels } from "@/lib/platform-billing";
import type {
  SubscriptionPaymentInstructions,
  SubscriptionPaymentMethod,
} from "@/types/platform-billing";
import { BillingError } from "./billing-parts";

const methods = Object.keys(subscriptionMethodLabels) as SubscriptionPaymentMethod[];

export function PlatformPaymentInstructions({ userId }: { userId?: string }) {
  const query = usePlatformPaymentMethods(userId);
  return (
    <details className="bg-card rounded-2xl border p-5">
      <summary className="cursor-pointer font-semibold">Purchase payment instructions</summary>
      <p className="text-muted-foreground mt-3 text-sm">
        Enter the receiving details buyers should use. Blank methods stay unavailable. These
        instructions are visible on the public purchase page.
      </p>
      {query.isError ? (
        <div className="mt-4 space-y-2">
          <BillingError message={toApiFailure(query.error).error} />
          <Button variant="outline" onClick={() => void query.refetch()}>
            Try again
          </Button>
        </div>
      ) : !query.data ? (
        <p className="text-muted-foreground mt-4 text-sm" role="status">
          Loading instructions…
        </p>
      ) : (
        <InstructionsForm initial={query.data} userId={userId} />
      )}
    </details>
  );
}

function InstructionsForm({
  initial,
  userId,
}: {
  initial: SubscriptionPaymentInstructions;
  userId?: string;
}) {
  const queryClient = useQueryClient();
  const form = useForm<SubscriptionPaymentInstructions>({ defaultValues: initial });
  const save = usePlatformCommand<SubscriptionPaymentInstructions, SubscriptionPaymentInstructions>(
    userId,
    "/payment-methods"
  );
  async function submit(values: SubscriptionPaymentInstructions) {
    try {
      const saved = await save.mutateAsync(values);
      form.reset(saved);
      await queryClient.invalidateQueries({ queryKey: ["owner-application", "payment-methods"] });
      toast.success("Purchase payment instructions saved");
    } catch {
      // The API error is displayed next to the form.
    }
  }
  return (
    <form className="mt-5 space-y-4" onSubmit={form.handleSubmit(submit)}>
      <fieldset disabled={save.isPending} className="grid gap-4 md:grid-cols-3">
        {methods.map((method) => (
          <div key={method} className="space-y-2">
            <Label htmlFor={`payment-instructions-${method}`}>
              {subscriptionMethodLabels[method]}
            </Label>
            <Textarea
              id={`payment-instructions-${method}`}
              rows={3}
              maxLength={method === "bank_transfer" ? 500 : 200}
              placeholder={
                method === "bank_transfer"
                  ? "Bank, account name and account number"
                  : "Number, account name and transfer instructions"
              }
              {...form.register(method)}
            />
          </div>
        ))}
      </fieldset>
      {save.isError && <BillingError message={toApiFailure(save.error).error} />}
      <Button type="submit" disabled={!form.formState.isDirty || save.isPending}>
        {save.isPending ? "Saving…" : "Save purchase instructions"}
      </Button>
    </form>
  );
}
