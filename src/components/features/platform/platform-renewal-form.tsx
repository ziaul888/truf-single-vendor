"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePlatformCommand } from "@/hooks/usePlatformBilling";
import { billingTodayInput, displayBillingDate, formatBdt } from "@/lib/platform-billing";
import { toApiFailure } from "@/lib/api-error";
import type { PlatformInvoice, PlatformSubscription } from "@/types/platform-billing";
import { BillingError } from "./billing-parts";
interface Props {
  userId?: string;
  subscription: PlatformSubscription;
  close: () => void;
  setBusy: (busy: boolean) => void;
}
export function PlatformRenewalForm({ userId, subscription, close, setBusy }: Props) {
  const [dueOn, setDueOn] = useState(billingTodayInput()),
    [error, setError] = useState("");
  const command = usePlatformCommand<{ dueOn: string }, PlatformInvoice>(
    userId,
    `/subscriptions/${subscription.id}/renewal-invoice`
  );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await command.mutateAsync({ dueOn });
      close();
    } catch (err) {
      setError(toApiFailure(err).error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="bg-muted rounded-xl p-3 text-sm leading-relaxed">
        {subscription.planName}: <strong>{formatBdt(subscription.amount)}</strong> /{" "}
        {subscription.interval === "monthly" ? "month" : "year"}. Next period starts{" "}
        {subscription.paidThrough ? displayBillingDate(subscription.paidThrough) : "after payment"}.
      </p>
      <div className="space-y-2">
        <Label htmlFor="renewal-due">Payment due</Label>
        <Input
          id="renewal-due"
          type="date"
          required
          min="2000-01-01"
          max="2100-12-31"
          value={dueOn}
          disabled={command.isPending}
          onChange={(e) => setDueOn(e.target.value)}
        />
      </div>
      <BillingError message={error} />
      <Button className="h-11 w-full" type="submit" disabled={command.isPending}>
        {command.isPending ? "Creating…" : "Create renewal invoice"}
      </Button>
    </form>
  );
}
export function PlatformCancellationForm({ userId, subscription, close, setBusy }: Props) {
  const [reason, setReason] = useState(""),
    [error, setError] = useState("");
  const command = usePlatformCommand<{ reason: string }, PlatformSubscription>(
    userId,
    `/subscriptions/${subscription.id}/cancel`
  );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await command.mutateAsync({ reason });
      close();
    } catch (err) {
      setError(toApiFailure(err).error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="bg-muted rounded-xl p-3 text-sm leading-relaxed">
        Paid periods remain valid until their end. Unpaid invoices will be voided. This action does
        not refund payments.
      </p>
      <div className="space-y-2">
        <Label htmlFor="cancellation-reason">Reason</Label>
        <Textarea
          id="cancellation-reason"
          required
          minLength={5}
          maxLength={500}
          rows={3}
          value={reason}
          disabled={command.isPending}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <BillingError message={error} />
      <Button
        className="h-11 w-full"
        variant="destructive"
        type="submit"
        disabled={reason.trim().length < 5 || command.isPending}
      >
        {command.isPending ? "Cancelling…" : "Confirm cancellation"}
      </Button>
    </form>
  );
}
