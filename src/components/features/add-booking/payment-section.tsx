"use client";

import { type UseFormReturn } from "react-hook-form";
import type { AddBookingFormData } from "@/schemas";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { CreditCard, Banknote, Building2, Store, Globe, CheckCircle2, CircleDot } from "lucide-react";

const today = new Date().toISOString().split("T")[0];

const BOOKING_TYPES = [
  { value: "offline", label: "Offline", desc: "Admin books on behalf, handles payment manually", icon: Store, note: "Cash / Bank transfer" },
  { value: "online", label: "Online (Stripe)", desc: "Customer pays full amount via Stripe", icon: Globe, note: "Card only · Full payment" },
] as const;

const ALL_METHODS = [
  { value: "cash", label: "Cash", desc: "Collect payment in person", icon: Banknote },
  { value: "bank_transfer", label: "Bank Transfer", desc: "Customer pays via bank", icon: Building2 },
  { value: "card", label: "Card (Stripe)", desc: "Stripe handles the transaction", icon: CreditCard },
] as const;

interface PaymentSectionProps {
  form: UseFormReturn<AddBookingFormData>;
  totalAmount: number;
}

export function PaymentSection({ form, totalAmount }: PaymentSectionProps) {
  const { watch, setValue, register, formState: { errors } } = form;
  const bookingType = watch("bookingType");
  const paymentMethod = watch("paymentMethod");
  const paymentType = watch("paymentType");
  const advanceAmount = Number(watch("advanceAmount") ?? 0);
  const dueAmount = Math.max(0, totalAmount - advanceAmount);
  const isPartial = bookingType === "offline" && paymentType === "partial";

  const autoPaymentStatus =
    bookingType === "online" ? "pending" : paymentType === "partial" ? "partial" : "paid";

  const availableMethods =
    bookingType === "online"
      ? ALL_METHODS.filter((m) => m.value === "card")
      : ALL_METHODS.filter((m) => m.value !== "card");

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-4 border-b px-6 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm">
          4
        </div>
        <div>
          <p className="font-semibold text-[15px] leading-snug">Payment</p>
          <p className="text-sm text-muted-foreground">Configure booking type and payment details</p>
        </div>
      </div>
      <div className="p-6 space-y-6">

        {/* Booking type — card selection */}
        <div className="space-y-2.5">
          <Label className="text-sm font-medium">Booking Type</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {BOOKING_TYPES.map(({ value, label, desc, icon: Icon, note }) => {
              const isActive = bookingType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setValue("bookingType", value);
                    setValue("paymentMethod", value === "online" ? "card" : "cash");
                    setValue("paymentType", "full");
                  }}
                  className={cn(
                    "group relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                    isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 hover:bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className={cn("text-sm font-semibold", isActive && "text-primary")}>{label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    <span className={cn(
                      "mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                      isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    )}>{note}</span>
                  </div>
                  {isActive && (
                    <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment method — card selection */}
        <div className="space-y-2.5">
          <Label className="text-sm font-medium">
            Payment Method <span className="text-destructive">*</span>
          </Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {availableMethods.map(({ value, label, desc, icon: Icon }) => {
              const isActive = paymentMethod === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("paymentMethod", value)}
                  className={cn(
                    "group relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                    isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 hover:bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={cn("text-sm font-semibold", isActive && "text-primary")}>{label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                  </div>
                  {isActive && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment type — offline only */}
        {bookingType === "offline" && (
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Payment Type</Label>
            <div className="flex gap-2">
              {(["full", "partial"] as const).map((type) => {
                const isActive = paymentType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue("paymentType", type)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all",
                      isActive ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "h-4 w-4 rounded-full border-2 transition-colors",
                      isActive ? "border-primary bg-primary" : "border-muted-foreground/40"
                    )}>
                      {isActive && <CircleDot className="h-full w-full text-primary-foreground scale-75" />}
                    </div>
                    {type === "full" ? "Full Payment" : "Partial Payment"}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Partial payment fields */}
        {isPartial && (
          <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-5 space-y-4 dark:bg-amber-950/20 dark:border-amber-700">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Banknote className="h-4 w-4" />
              <p className="text-sm font-semibold">Partial Payment Details</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium" htmlFor="advanceAmount">
                  Advance Amount <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground select-none">৳</span>
                  <Input id="advanceAmount" type="number" min={1} max={totalAmount - 1} placeholder="0" className="h-10 pl-7" {...register("advanceAmount")} />
                </div>
                {errors.advanceAmount && <p className="text-xs text-destructive">{errors.advanceAmount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Due Amount</Label>
                <div className="flex h-10 items-center rounded-md border bg-muted/50 px-3 text-sm font-semibold text-amber-700 dark:text-amber-400">
                  {formatCurrency(dueAmount)}
                </div>
                <p className="text-xs text-muted-foreground">Auto — total minus advance</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium" htmlFor="dueDate">
                  Due Date <span className="text-destructive">*</span>
                </Label>
                <Input id="dueDate" type="date" min={today} className="h-10" {...register("dueDate")} />
                {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium" htmlFor="partialNote">Payment Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <textarea
                id="partialNote"
                rows={2}
                placeholder="e.g. 50% advance agreed, balance due by end of month"
                className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("partialNote")}
              />
            </div>
          </div>
        )}

        {/* Payment status */}
        <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-5 py-3">
          <div>
            <p className="text-sm font-medium">Payment Status</p>
            <p className="text-xs text-muted-foreground mt-0.5">Automatically set based on your selections</p>
          </div>
          <Badge
            variant={autoPaymentStatus === "paid" ? "default" : autoPaymentStatus === "partial" ? "secondary" : "outline"}
            className="capitalize px-3 py-1 text-xs font-semibold"
          >
            {autoPaymentStatus}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
