"use client";
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
import { usePlatformCommand } from "@/hooks/usePlatformBilling";
import { billingTodayInput, formatBdt } from "@/lib/platform-billing";
import { toApiFailure } from "@/lib/api-error";
import type { PlatformInvoice } from "@/types/platform-billing";
import { BillingError } from "./billing-parts";
export const receiptMethods = { bkash: "bKash", nagad: "Nagad", bank_transfer: "Bank transfer" };
type Method = keyof typeof receiptMethods;
interface Values {
  method: Method;
  reference: string;
  receivedOn: string;
  confirmed: boolean;
}
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
        <div className="space-y-2">
          <Label htmlFor="receipt-method">Payment method</Label>
          <Select
            value={values.method}
            onValueChange={(method) => {
              if (method === "bkash" || method === "nagad" || method === "bank_transfer")
                setValues({ ...values, method });
            }}
          >
            <SelectTrigger id="receipt-method">
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
          <Label htmlFor="receipt-reference">Transaction / bank reference</Label>
          <Input
            id="receipt-reference"
            required
            minLength={3}
            maxLength={100}
            value={values.reference}
            onChange={(e) => setValues({ ...values, reference: e.target.value })}
          />
          <p className="text-muted-foreground text-xs">
            Use the reference shown in your receiving account.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="receipt-date">Payment received on</Label>
          <Input
            id="receipt-date"
            type="date"
            required
            min="2000-01-01"
            max={billingTodayInput()}
            value={values.receivedOn}
            onChange={(e) => setValues({ ...values, receivedOn: e.target.value })}
          />
        </div>
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
