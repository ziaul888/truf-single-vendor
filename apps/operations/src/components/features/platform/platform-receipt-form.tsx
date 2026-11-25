"use client";
import { useId, useState } from "react";
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
import { usePlatformCommand } from "@/hooks/usePlatformBilling";
import { billingTodayInput, formatBdt } from "@/lib/platform-billing";
import { toApiFailure } from "@/lib/api-error";
import type { PlatformInvoice } from "@/types/platform-billing";
import { BillingError } from "./billing-parts";
export const receiptMethods = { bkash: "bKash", nagad: "Nagad", bank_transfer: "Bank transfer" };
type Method = keyof typeof receiptMethods;
export interface ReceiptDetails {
  method: Method;
  reference: string;
  receivedOn: string;
}

export function ReceiptDetailsFields({
  details,
  onChange,
}: {
  details: ReceiptDetails;
  onChange: (details: ReceiptDetails) => void;
}) {
  const id = useId();
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${id}-method`}>Payment method</Label>
        <Select
          value={details.method}
          onValueChange={(method) => {
            if (method === "bkash" || method === "nagad" || method === "bank_transfer") {
              onChange({ ...details, method });
            }
          }}
        >
          <SelectTrigger id={`${id}-method`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(receiptMethods).map(([value, label]) => (
              <SelectItem value={value} key={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-reference`}>Transaction / bank reference</Label>
        <Input
          id={`${id}-reference`}
          required
          minLength={3}
          maxLength={100}
          value={details.reference}
          onChange={(e) => onChange({ ...details, reference: e.target.value })}
        />
        <p className="text-muted-foreground text-xs">
          Use the reference shown in your receiving account.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${id}-date`}>Payment received on</Label>
        <Input
          id={`${id}-date`}
          type="date"
          required
          min="2000-01-01"
          max={billingTodayInput()}
          value={details.receivedOn}
          onChange={(e) => onChange({ ...details, receivedOn: e.target.value })}
        />
      </div>
    </>
  );
}

type Values = ReceiptDetails & { confirmed: boolean };
export function PlatformReceiptForm({
  userId,
  invoice,
  close,
  setBusy,
}: {
  userId?: string;
  invoice: PlatformInvoice;
  close: () => void;
  setBusy: (busy: boolean) => void;
}) {
  const [values, setValues] = useState<Values>({
      method: "bkash",
      reference: "",
      receivedOn: billingTodayInput(),
      confirmed: false,
    }),
    [error, setError] = useState("");
  const command = usePlatformCommand<Values, PlatformInvoice>(
    userId,
    `/invoices/${invoice.id}/record-payment`
  );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await command.mutateAsync({ ...values, reference: values.reference.trim() });
      close();
    } catch (err) {
      setError(toApiFailure(err).error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="bg-muted rounded-xl p-4">
        <p className="text-muted-foreground text-xs">Full invoice amount</p>
        <p className="mt-1 text-2xl font-bold break-words">{formatBdt(invoice.amount)}</p>
        <p className="text-muted-foreground mt-1 text-xs break-all">{invoice.number}</p>
      </div>
      <fieldset disabled={command.isPending} className="space-y-5">
        <ReceiptDetailsFields
          details={values}
          onChange={(details) => setValues({ ...values, ...details })}
        />
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm leading-relaxed">
          <input
            type="checkbox"
            required
            className="accent-primary mt-1 h-4 w-4 shrink-0"
            checked={values.confirmed}
            onChange={(e) => setValues({ ...values, confirmed: e.target.checked })}
          />
          <span>
            I verified that the full {formatBdt(invoice.amount)} payment arrived in my receiving
            account.
          </span>
        </label>
      </fieldset>
      <BillingError message={error} />
      <Button
        className="h-11 w-full"
        type="submit"
        disabled={!values.confirmed || command.isPending}
      >
        {command.isPending ? "Recording…" : "Record verified payment"}
      </Button>
    </form>
  );
}
