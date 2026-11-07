"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { WalletMethod } from "@/types/booking";
import { Field, WALLET_LABEL } from "./checkout-fields";
import type { CheckoutFormValues } from "./checkout-schema";

/** bKash / Nagad: where to send the money, then the TrxID and the number it was sent from. */
export function WalletFields({
  method, number, total, register, errors,
}: {
  method: WalletMethod; number: string; total: string | null;
  register: UseFormRegister<CheckoutFormValues>; errors: FieldErrors<CheckoutFormValues>;
}) {
  const name = WALLET_LABEL[method];
  return (
    <div className="mt-4 space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <p className="text-sm">
        Send <strong>{total ?? "the total"}</strong> to <strong className="font-mono">{number}</strong> ({name}), including the service fee.
        Then enter the transaction ID from your {name} app.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="reference" label="TrxID" autoComplete="off" className="[&_input]:font-mono [&_input]:uppercase"
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
