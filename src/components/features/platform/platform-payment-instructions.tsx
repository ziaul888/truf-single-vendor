"use client";

import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Wallet } from "lucide-react";
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
import { PlatformSettingsSection, PlatformSettingsStatus } from "./platform-settings-section";

const methods = Object.keys(subscriptionMethodLabels) as SubscriptionPaymentMethod[];

export function PlatformPaymentInstructions({ userId }: { userId?: string }) {
  const query = usePlatformPaymentMethods(userId);
  return (
    <PlatformSettingsSection
      title="Subscription payment instructions"
      icon={Wallet}
      description="These receiving details appear on the public plan application page. Leave a method blank to hide it from applicants."
    >
      {query.data ? (
        <InstructionsForm initial={query.data} userId={userId} />
      ) : (
        <PlatformSettingsStatus
          subject="payment instructions"
          error={query.error}
          fetching={query.isFetching}
          onRetry={() => void query.refetch()}
        />
      )}
    </PlatformSettingsSection>
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
      toast.success("Subscription payment instructions saved");
    } catch {
      // The API error is displayed next to the form.
    }
  }
  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
      <fieldset disabled={save.isPending} className="grid gap-4 sm:grid-cols-2">
        {methods.map((method) => (
          <div
            key={method}
            className={method === "bank_transfer" ? "space-y-2 sm:col-span-2" : "space-y-2"}
          >
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
      <div className="flex justify-end border-t pt-4">
        <Button
          type="submit"
          className="min-h-11 w-full sm:w-auto"
          disabled={!form.formState.isDirty || save.isPending}
        >
          {save.isPending ? "Saving…" : "Save payment instructions"}
        </Button>
      </div>
    </form>
  );
}
