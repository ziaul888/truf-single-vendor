"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Wallet } from "lucide-react";
import { PortalApiError, startCheckout, markLeavingForPayment, toAppPath } from "@/lib/portal-bookings";
import { useCustomerSession } from "@/components/portal/account/use-customer-session";
import { CheckoutFormSchema, CHECKOUT_FIELDS, type CheckoutFormValues } from "./checkout-schema";
import { Field, PaymentChoice } from "./checkout-fields";
import { takaLabel } from "./checkout-totals";
import { useCheckoutOptions } from "./use-checkout-options";

interface FormError { message: string; slotTaken: boolean }

export function CheckoutForm({
  groundId, date, hour, slotPrice, disabled,
}: {
  groundId: string; date: string; hour: number; slotPrice: number; disabled: boolean;
}) {
  const router = useRouter();
  const options = useCheckoutOptions();
  // Signed-in customers book on their verified phone (read-only); name and email are prefilled.
  const { data: session } = useCustomerSession();
  const [formError, setFormError] = useState<FormError | null>(null);
  const [leaving, setLeaving] = useState(false);
  const { register, handleSubmit, watch, setValue, setError, formState: { errors, isSubmitting } } =
    useForm<CheckoutFormValues>({
      resolver: zodResolver(CheckoutFormSchema),
      defaultValues: { customerName: "", customerEmail: "", customerPhone: "", paymentMethod: "card", acceptTerms: false },
    });

  useEffect(() => {
    if (!session) return;
    setValue("customerPhone", session.phone, { shouldValidate: true });
    if (session.name && !watch("customerName")) setValue("customerName", session.name);
    if (session.email && !watch("customerEmail")) setValue("customerEmail", session.email);
  }, [session, setValue, watch]);

  const cashEnabled = options.data?.cashEnabled ?? false;
  const method = cashEnabled ? watch("paymentMethod") : "card";
  const busy = isSubmitting || leaving;

  const onSubmit = async (values: CheckoutFormValues) => {
    setFormError(null);
    try {
      const { customerName, customerEmail, customerPhone } = values;
      const result = await startCheckout({
        groundId, date, hour, customerName, customerEmail, customerPhone, paymentMethod: method,
      });
      setLeaving(true);
      if (result.checkoutUrl) {
        markLeavingForPayment(result.bookingId, 0);
        window.location.href = result.checkoutUrl;
      }
      else router.push(toAppPath(result.confirmationUrl));
    } catch (err) {
      setLeaving(false);
      showError(err);
    }
  };

  const showError = (err: unknown) => {
    if (!(err instanceof PortalApiError)) {
      setFormError({ message: "Something went wrong. Please try again.", slotTaken: false });
      return;
    }
    const fieldErrors = (err.details ?? []).filter((d) =>
      (CHECKOUT_FIELDS as readonly string[]).includes(d.field)
    );
    fieldErrors.forEach((d) => setError(d.field as (typeof CHECKOUT_FIELDS)[number], { message: d.message }));
    if (fieldErrors.length && fieldErrors.length === err.details?.length) return;
    setFormError({ message: err.message, slotTaken: err.code === "SLOT_NOT_AVAILABLE" });
  };

  const total = options.data ? takaLabel(slotPrice + options.data.serviceFee) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-6 rounded-2xl border bg-card p-6">
      <div>
        <h2 className="mb-4 font-bold">Your details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="customerName" label="Full name" autoComplete="name" error={errors.customerName?.message} {...register("customerName")} />
          <Field
            id="customerPhone" label="Phone" type="tel" autoComplete="tel" readOnly={!!session}
            hint={session ? "Signed in with this number." : undefined}
            className={session ? "[&_input]:bg-muted [&_input]:opacity-80" : undefined}
            error={errors.customerPhone?.message} {...register("customerPhone")}
          />
          <Field
            id="customerEmail" label="Email" type="email" autoComplete="email" className="sm:col-span-2"
            hint="Your confirmation link will be sent here."
            error={errors.customerEmail?.message} {...register("customerEmail")}
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Wallet className="h-4 w-4" /> Payment
        </h2>
        {options.isPending ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading payment options…
          </p>
        ) : options.isError ? (
          <p role="alert" className="text-sm text-destructive">
            Couldn&apos;t load payment options.{" "}
            <button type="button" onClick={() => options.refetch()} className="underline">Try again</button>
          </p>
        ) : (
          <PaymentChoice
            value={method}
            onChange={(m) => setValue("paymentMethod", m)}
            cashEnabled={cashEnabled}
            holdMinutes={options.data.holdMinutes}
          />
        )}
        {errors.paymentMethod && <p className="mt-1 text-[11px] text-destructive">{errors.paymentMethod.message}</p>}
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-0.5 accent-primary" {...register("acceptTerms")} />
          <span>
            I agree to the <a href="#" className="underline">terms</a> and free-cancellation policy.
          </span>
        </label>
        {errors.acceptTerms && <p className="mt-1 text-[11px] text-destructive">{errors.acceptTerms.message}</p>}
      </div>

      {formError && (
        <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {formError.slotTaken ? "Sorry, someone just booked this slot." : formError.message}
          {formError.slotTaken && (
            <Link href={`/grounds/${groundId}`} className="ml-1 font-semibold underline">Pick another time</Link>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={disabled || busy || !options.data}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        {submitLabel(method, total, busy)}
      </button>
    </form>
  );
}

function submitLabel(method: "card" | "cash", total: string | null, busy: boolean) {
  if (busy) return method === "card" ? "Taking you to payment…" : "Reserving your slot…";
  if (method === "cash") return total ? `Reserve · pay ${total} at the venue` : "Reserve slot";
  return total ? `Continue to pay ${total}` : "Continue to payment";
}
