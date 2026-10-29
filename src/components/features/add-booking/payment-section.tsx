"use client";

import { type UseFormReturn } from "react-hook-form";
import type { AddBookingFormData } from "@/schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { venueToday } from "@/lib/slot-format";
import { Banknote, Building2, CheckCircle2, Clock, Wallet, HandCoins } from "lucide-react";
import { takaLabel } from "@/components/features/bookings/booking-status-helpers";
import { SectionCard } from "./section-card";

type PaymentType = AddBookingFormData["paymentType"];

export const PAYMENT_TYPES = [
  { value: "full", label: "Full payment", desc: "Customer pays the whole amount now", icon: Wallet, note: "Confirmed · Paid" },
  { value: "partial", label: "Advance", desc: "Customer pays part now, the rest later", icon: HandCoins, note: "Confirmed · Partial" },
  { value: "none", label: "Pay later", desc: "Nothing collected yet; confirm when paid", icon: Clock, note: "Pending · Unpaid" },
] as const satisfies readonly { value: PaymentType; label: string; desc: string; icon: typeof Wallet; note: string }[];

const METHODS = [
  { value: "cash", label: "Cash", desc: "Collected in person", icon: Banknote },
  { value: "bank_transfer", label: "Bank Transfer", desc: "Customer pays via bank", icon: Building2 },
] as const;

/** The booking and payment status the API will set for a payment type. */
export const PAYMENT_OUTCOME: Record<PaymentType, { status: string; payment: string }> = {
  full: { status: "confirmed", payment: "paid" },
  partial: { status: "confirmed", payment: "partial" },
  none: { status: "pending", payment: "unpaid" },
};

const optionClass = (active: boolean) => cn(
  "group relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
  active ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 hover:bg-muted/30",
);
const iconClass = (active: boolean) => cn(
  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
);

interface PaymentSectionProps {
  form: UseFormReturn<AddBookingFormData>;
  /** Slot price in whole currency units. */
  totalAmount: number;
}

export function PaymentSection({ form, totalAmount }: PaymentSectionProps) {
  const { watch, setValue, clearErrors, register, formState: { errors } } = form;
  const paymentMethod = watch("paymentMethod");
  const paymentType = watch("paymentType");
  const advanceAmount = Number(watch("advanceAmount") ?? 0);
  const dueAmount = Math.max(0, totalAmount - advanceAmount);
  const outcome = PAYMENT_OUTCOME[paymentType];

  return (
    <SectionCard n="3" title="Payment" desc="What the customer pays now, and how">
      <div className="space-y-6">
        <div className="space-y-2.5">
          <Label className="text-sm font-medium">Payment Type</Label>
          <div className="grid gap-3 sm:grid-cols-3">
            {PAYMENT_TYPES.map(({ value, label, desc, icon: Icon, note }) => {
              const isActive = paymentType === value;
              return (
                <button key={value} type="button" className={optionClass(isActive)}
                  onClick={() => { setValue("paymentType", value); clearErrors(["advanceAmount", "dueDate"]); }}>
                  <div className={iconClass(isActive)}><Icon className="h-4 w-4" /></div>
                  <div className="min-w-0">
                    <p className={cn("text-sm font-semibold", isActive && "text-primary")}>{label}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                    <span className={cn(
                      "mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                      isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                    )}>{note}</span>
                  </div>
                  {isActive && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {paymentType !== "none" && (
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Payment Method <span className="text-destructive">*</span></Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {METHODS.map(({ value, label, desc, icon: Icon }) => {
                const isActive = paymentMethod === value;
                return (
                  <button key={value} type="button" className={optionClass(isActive)} onClick={() => setValue("paymentMethod", value)}>
                    <div className={iconClass(isActive)}><Icon className="h-4 w-4" /></div>
                    <div>
                      <p className={cn("text-sm font-semibold", isActive && "text-primary")}>{label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                    </div>
                    {isActive && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
            {errors.paymentMethod && <p className="text-xs text-destructive">{errors.paymentMethod.message}</p>}
          </div>
        )}

        {paymentType === "partial" && (
          <div className="space-y-4 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-5 dark:border-amber-700 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Banknote className="h-4 w-4" />
              <p className="text-sm font-semibold">Advance Payment Details</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium" htmlFor="advanceAmount">Advance Amount <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 select-none text-sm font-medium text-muted-foreground">৳</span>
                  <Input id="advanceAmount" type="number" step="0.01" min={1} max={totalAmount > 0 ? totalAmount - 1 : undefined}
                    placeholder="0" className="h-10 pl-7" {...register("advanceAmount")} />
                </div>
                {errors.advanceAmount && <p className="text-xs text-destructive">{errors.advanceAmount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Due Amount</Label>
                <div className="flex h-10 items-center rounded-md border bg-muted/50 px-3 text-sm font-semibold text-amber-700 dark:text-amber-400">
                  {takaLabel(dueAmount)}
                </div>
                <p className="text-xs text-muted-foreground">Auto: total minus advance</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium" htmlFor="dueDate">Due Date <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Input id="dueDate" type="date" min={venueToday()} className="h-10" {...register("dueDate")} />
                {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium" htmlFor="partialNote">Payment Note <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <textarea id="partialNote" rows={2} placeholder="e.g. Rest at the counter before the game"
                className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                {...register("partialNote")} />
              {errors.partialNote && <p className="text-xs text-destructive">{errors.partialNote.message}</p>}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-5 py-3">
          <div>
            <p className="text-sm font-medium">Resulting Status</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {paymentType === "none" ? "Shows up in Confirm Bookings until it's paid" : "Set automatically from the payment type"}
            </p>
          </div>
          <div className="flex gap-1.5">
            <Badge variant={outcome.status === "confirmed" ? "default" : "secondary"} className="px-3 py-1 text-xs font-semibold capitalize">{outcome.status}</Badge>
            <Badge variant={outcome.payment === "paid" ? "default" : outcome.payment === "partial" ? "secondary" : "outline"}
              className="px-3 py-1 text-xs font-semibold capitalize">{outcome.payment}</Badge>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
