"use client";

import type { InputHTMLAttributes } from "react";
import { Banknote, CreditCard } from "lucide-react";

const INPUT_CLASS =
  "mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive";

export function Field({
  label, id, error, hint, className, ...input
}: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; error?: string; hint?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <input id={id} aria-invalid={!!error} className={INPUT_CLASS} {...input} />
      {error ? (
        <p className="mt-1 text-[11px] text-destructive">{error}</p>
      ) : (
        hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

type Method = "card" | "cash";

/** Card (Stripe Checkout) and, when the venue allows it, cash at the venue. */
export function PaymentChoice({
  value, onChange, cashEnabled, holdMinutes,
}: {
  value: Method; onChange: (m: Method) => void; cashEnabled: boolean; holdMinutes?: number;
}) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="space-y-2">
      <Option
        selected={value === "card"}
        onSelect={() => onChange("card")}
        icon={<CreditCard className="h-4 w-4" />}
        title="Card"
        description={`Pay securely on Stripe's checkout page.${
          holdMinutes ? ` Your slot is held for ${holdMinutes} minutes once you continue.` : ""
        }`}
      />
      {cashEnabled && (
        <Option
          selected={value === "cash"}
          onSelect={() => onChange("cash")}
          icon={<Banknote className="h-4 w-4" />}
          title="Pay at venue (cash)"
          description="Reserve now and pay in cash when you arrive. The venue confirms your booking."
        />
      )}
    </div>
  );
}

function Option({
  selected, onSelect, icon, title, description,
}: {
  selected: boolean; onSelect: () => void; icon: React.ReactNode; title: string; description: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left text-sm transition-colors ${
        selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-muted/40 hover:bg-muted"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          selected ? "border-primary" : "border-muted-foreground/50"
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      <span>
        <span className="flex items-center gap-2 font-semibold">
          {icon} {title}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}
