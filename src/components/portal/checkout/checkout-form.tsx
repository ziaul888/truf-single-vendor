"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Wallet } from "lucide-react";
import { PortalApiError, startCheckout, markLeavingForPayment, toAppPath } from "@/lib/portal-bookings";
import type { CheckoutMethod } from "@/types/booking";
import { useCustomerSession } from "@/components/portal/account/use-customer-session";
import { CheckoutFormSchema, CHECKOUT_FIELDS, type CheckoutFormValues } from "./checkout-schema";
import { Field, PaymentChoice } from "./checkout-fields";
import { takaLabel } from "./checkout-totals";
import { useCheckoutOptions } from "./use-checkout-options";
import { WalletFields } from "./wallet-fields";

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
      defaultValues: {
        customerName: "", customerEmail: "", customerPhone: "", paymentMethod: "card", reference: "", payerNumber: "", acceptTerms: false,
      },
    });

  useEffect(() => {
    if (!session) return;
    setValue("customerPhone", session.phone, { shouldValidate: true });
    if (session.name && !watch("customerName")) setValue("customerName", session.name);
    if (session.email && !watch("customerEmail")) setValue("customerEmail", session.email);
  }, [session, setValue, watch]);

  // An older API without the field still takes card payments.
  const cardEnabled = !!options.data && options.data.cardEnabled !== false;
  const cashEnabled = options.data?.cashEnabled ?? false;
  const wallets = options.data?.wallets ?? [];
  // The methods on offer, in display order; the choice falls back to the first one available.
  const available: CheckoutMethod[] = [
    ...(cardEnabled ? ["card" as const] : []), ...(cashEnabled ? ["cash" as const] : []), ...wallets.map((w) => w.method),
  ];
  const canPay = available.length > 0;
  const chosen = watch("paymentMethod");
  const method = available.includes(chosen) ? chosen : (available[0] ?? "card");
  const wallet = wallets.find((w) => w.method === method);
  const busy = isSubmitting || leaving;

  // Keep the form's value on the method shown, so the wallet fields are validated when they apply.
  useEffect(() => {
    if (options.data && chosen !== method) setValue("paymentMethod", method);
  }, [options.data, chosen, method, setValue]);

  const onSubmit = async (values: CheckoutFormValues) => {
    setFormError(null);
    try {
      const { customerName, customerEmail, customerPhone, reference, payerNumber } = values;
      const result = await startCheckout({
        groundId, date, hour, customerName, customerEmail, customerPhone, paymentMethod: method,
        ...(wallet && { reference: reference.trim().toUpperCase(), payerNumber: payerNumber.trim() }),
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
    if (err.code === "REFERENCE_ALREADY_USED") return setError("reference", { message: err.message });
    if (err.code === "SLOT_NOT_AVAILABLE") setFormError({ message: "Sorry, someone just booked this slot.", slotTaken: true });
    else if (err.code === "GROUND_CLOSED") setFormError({ message: "Sorry, the ground is closed on that day.", slotTaken: true });
    else setFormError({ message: err.message, slotTaken: false });
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
            cardEnabled={cardEnabled}
            cashEnabled={cashEnabled}
            wallets={wallets}
            holdMinutes={options.data.holdMinutes}
          />
        )}
        {wallet && <WalletFields method={wallet.method} number={wallet.number} total={total} register={register} errors={errors} />}
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
          {formError.message}
          {formError.slotTaken && (
            <Link href={`/grounds/${groundId}`} className="ml-1 font-semibold underline">Pick another time</Link>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={disabled || busy || !canPay}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        {options.data && !canPay ? "Online booking unavailable" : submitLabel(method, total, busy)}
      </button>
    </form>
  );
}

function submitLabel(method: CheckoutMethod, total: string | null, busy: boolean) {
  if (busy) return method === "card" ? "Taking you to payment…" : "Reserving your slot…";
  if (method === "cash") return total ? `Reserve · pay ${total} at the venue` : "Reserve slot";
  if (method !== "card") return total ? `Book · I've sent ${total}` : "Book slot";
  return total ? `Continue to pay ${total}` : "Continue to payment";
}
