"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { WalletMethod } from "@/types/booking";
import { Field, WALLET_LABEL } from "./checkout-fields";
import type { CheckoutFormValues } from "./checkout-schema";

/** What a cash booking pays by wallet now (booking money) and at the venue; amounts as "৳1,550". */
export interface BookingMoneyAmounts { deposit: string; balance: string; percent: number }

/**
 * bKash / Nagad: where to send the money, then the TrxID and the number it was sent from. With
 * `bookingMoney` (a cash booking) it is only the booking money; the balance is paid in cash.
 */
export function WalletFields({
  method, number, total, bookingMoney, register, errors,
}: {
  method: WalletMethod; number: string; total: string | null; bookingMoney?: BookingMoneyAmounts;
  register: UseFormRegister<CheckoutFormValues>; errors: FieldErrors<CheckoutFormValues>;
}) {
  const name = WALLET_LABEL[method];
  return (
    <div className="mt-4 space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
      {bookingMoney ? (
        <>
          <p className="text-sm font-semibold">
            Booking money <strong>{bookingMoney.deposit}</strong> now ({bookingMoney.percent}%) · {bookingMoney.balance} at the venue
          </p>
          <p className="text-sm">
            Send the booking money <strong>{bookingMoney.deposit}</strong> (not the full total) to{" "}
            <strong className="font-mono">{number}</strong> ({name}). Then enter the transaction ID from your {name} app.
            The venue checks the payment before confirming; the rest, {bookingMoney.balance}, is paid in cash at the venue.
          </p>
        </>
      ) : (
        <p className="text-sm">
          Send <strong>{total ?? "the total"}</strong> to <strong className="font-mono">{number}</strong> ({name}), including the service fee.
          Then enter the transaction ID from your {name} app.
        </p>
      )}
      <CopyNumber number={number} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="reference" label="TrxID" autoComplete="off" autoCapitalize="characters" autoCorrect="off" spellCheck={false}
          className="[&_input]:font-mono [&_input]:uppercase"
          hint={`From your ${name} confirmation message.`}
          error={errors.reference?.message} {...register("reference")}
        />
        <Field
          id="payerNumber" label={`Sent from (${name} number)`} type="tel" autoComplete="tel"
          error={errors.payerNumber?.message} {...register("payerNumber")}
        />
      </div>
    </div>
  );
}

/** Copies the venue's wallet number, to paste into the bKash / Nagad app; says "Copied" for a moment. */
function CopyNumber({ number }: { number: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
    } catch {
      // No clipboard (e.g. an insecure context): the number is shown above to copy by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex h-10 items-center gap-2 rounded-lg border bg-background px-3 text-sm font-semibold hover:bg-muted"
    >
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      <span aria-live="polite">{copied ? "Copied" : `Copy ${number}`}</span>
    </button>
  );
}

/** Booking money: pick which wallet the customer sends it through (only when the venue offers both). */
export function DepositWalletPicker({
  wallets, value, onChange,
}: {
  wallets: { method: WalletMethod; number: string }[]; value: WalletMethod; onChange: (m: WalletMethod) => void;
}) {
  if (wallets.length < 2) return null;
  return (
    <div role="radiogroup" aria-label="Send booking money with" className="mt-4 grid grid-cols-2 gap-2">
      {wallets.map(({ method }) => (
        <button
          key={method}
          type="button"
          role="radio"
          aria-checked={value === method}
          onClick={() => onChange(method)}
          className={`h-11 rounded-lg border text-sm font-semibold transition-colors ${
            value === method ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-muted/40 hover:bg-muted"
          }`}
        >
          {WALLET_LABEL[method]}
        </button>
      ))}
    </div>
  );
}
