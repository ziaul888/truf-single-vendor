"use client";

import { fromMinorUnits } from "@/lib/ground-format";
import { useCheckoutOptions } from "./use-checkout-options";

/** "৳1,550" from an amount in the smallest unit. */
export const takaLabel = (minor: number) => `৳${fromMinorUnits(minor).toLocaleString()}`;

/** Price lines for the summary sidebar: slot price plus the service fee from turf-api. */
export function CheckoutTotals({ slotPrice, isPeak }: { slotPrice: number; isPeak: boolean }) {
  const { data: options, isPending, isError } = useCheckoutOptions();
  const fee = options ? takaLabel(options.serviceFee) : isPending ? "…" : "—";
  const total = options ? takaLabel(slotPrice + options.serviceFee) : isPending ? "…" : "—";

  return (
    <div className="mt-4 space-y-1.5 border-t pt-4 text-sm">
      <Line label={isPeak ? "Slot (peak)" : "Slot"} value={takaLabel(slotPrice)} />
      <Line label="Service fee" value={fee} />
      <Line label="Total" value={total} bold />
      {isError && <p className="text-xs text-destructive">Couldn&apos;t load the service fee.</p>}
    </div>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "border-t pt-2 text-base font-bold" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
