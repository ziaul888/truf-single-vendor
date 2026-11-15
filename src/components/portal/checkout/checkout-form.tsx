"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock, Wallet } from "lucide-react";
import { PortalApiError, startCheckout, markLeavingForPayment, toAppPath } from "@/lib/portal-bookings";
import type { CheckoutMethod } from "@/types/booking";
import { CUSTOMER_SESSION_KEY, useCustomerSession } from "@/components/portal/account/use-customer-session";
import { checkoutFormSchema, CHECKOUT_FIELDS, EMAIL_REQUIRED_MESSAGE, type CheckoutFormValues } from "./checkout-schema";
import { Field, PaymentChoice, SignInNotice } from "./checkout-fields";
import { formatSlotsParam, slotStartMinute, slotStartTime } from "@/lib/slot-format";
import { bookingSlotLimit } from "@/lib/booking-limits";
import type { PublicSlot } from "@/types/slot";
import { slotsSubtotal, takaLabel } from "./checkout-totals";
import { useCheckoutOptions } from "@/hooks/useCheckoutOptions";
import { DepositWalletPicker, WalletFields } from "./wallet-fields";
import { cashDepositAmount } from "@/lib/cash-deposit";
import type { WalletMethod } from "@/types/booking";

interface FormError { message: string; slotTaken: boolean; myBookings?: boolean }

export function CheckoutForm({
  groundId, date, slots, disabled, initialMethod = "card",
}: {
  /** One ground and date; 1 to 4 slots, earliest first (prices in the smallest unit). */
  groundId: string; date: string; slots: PublicSlot[]; disabled: boolean;
  /** The method chosen before signing in (`?method=` on the way back). */
  initialMethod?: CheckoutMethod;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const options = useCheckoutOptions();
  const maxSlots = bookingSlotLimit(options.data);
  const exceedsSlotLimit = slots.length > maxSlots;
  // Signed-in customers book on their verified phone (read-only); name and email are prefilled.
  const { data: session, isPending: sessionPending } = useCustomerSession();
  const [formError, setFormError] = useState<FormError | null>(null);
  const [leaving, setLeaving] = useState(false);
  // Email is optional once signed in, required for a guest.
  // Booking money: a cash booking also pays a share by bKash / Nagad (null = off or an older API).
  const depositPercent = options.data?.cashDepositPercent ?? null;
  const schema = useMemo(() => checkoutFormSchema(!!session, depositPercent !== null), [session, depositPercent]);
  const [depositChoice, setDepositChoice] = useState<WalletMethod | null>(null);
  const { register, handleSubmit, watch, setValue, setError, formState: { errors, isSubmitting } } =
    useForm<CheckoutFormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        customerName: "", customerEmail: "", customerPhone: "", paymentMethod: initialMethod, reference: "", payerNumber: "", acceptTerms: false,
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
  const bookingMoneyOn = method === "cash" && depositPercent !== null;
  // The wallet for booking money: the customer's pick, else the first one available.
  const depositWallet = wallets.find((w) => w.method === depositChoice) ?? wallets[0];
  const payWallet = bookingMoneyOn ? depositWallet : wallet;
  const busy = isSubmitting || leaving;
  // Cash, bKash and Nagad need a signed-in customer (turf-api: 401 SIGN_IN_REQUIRED); card stays open to guests.
  const needsSignIn = method !== "card" && !session;
  const slotsParam = formatSlotsParam(slots.map(slotStartTime));
  const signInHref = `/sign-in?from=${encodeURIComponent(`/checkout?groundId=${groundId}&date=${date}&slots=${slotsParam}&method=${method}`)}`;

  // Keep the form's value on the method shown, so the wallet fields are validated when they apply.
  useEffect(() => {
    if (options.data && chosen !== method) setValue("paymentMethod", method);
  }, [options.data, chosen, method, setValue]);

  const onSubmit = async (values: CheckoutFormValues) => {
    setFormError(null);
    if (exceedsSlotLimit) {
      setFormError({ message: `You can book up to ${maxSlots} slots at a time. Pick fewer slots and try again.`, slotTaken: true });
      return;
    }
    try {
      const { customerName, customerEmail, customerPhone, reference, payerNumber } = values;
      const result = await startCheckout({
        groundId, date, slots: slots.map((s) => ({ startHour: s.startHour, startMinute: slotStartMinute(s) })),
        customerName, customerEmail, customerPhone, paymentMethod: method,
        ...(payWallet && {
          ...(bookingMoneyOn && { depositMethod: payWallet.method }),
          reference: reference.trim().toUpperCase(), payerNumber: payerNumber.trim(),
        }),
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
    if (err.code === "EMAIL_REQUIRED") return setError("customerEmail", { message: EMAIL_REQUIRED_MESSAGE });
    if (err.code === "SIGN_IN_REQUIRED") {
      // The session ended meanwhile: drop it so the sign-in notice shows.
      queryClient.setQueryData(CUSTOMER_SESSION_KEY, null);
      setFormError({ message: "Please sign in with your phone number to pay at the venue or by bKash / Nagad.", slotTaken: false });
    } else if (err.code === "TOO_MANY_OPEN_BOOKINGS") {
      setFormError({
        message: "You already have 3 unpaid bookings waiting. Pay or cancel one of them first, or pay by card.",
        slotTaken: false, myBookings: true,
      });
    } else if (err.code === "TOO_MANY_SLOTS") {
      options.refetch();
      setFormError({ message: "Your selection exceeds the current booking limit. Pick fewer slots and try again.", slotTaken: true });
    } else if (err.code === "SLOTS_MUST_SHARE_GROUND_DATE") {
      setFormError({ message: "All slots in one booking must be on the same ground and day.", slotTaken: true });
    } else if (err.code === "TOO_MANY_ATTEMPTS") {
      setFormError({ message: "Too many booking attempts. Please wait a few minutes and try again.", slotTaken: false });
    } else if (err.code === "SLOT_NOT_AVAILABLE") setFormError({ message: "Sorry, someone just booked one of these slots.", slotTaken: true });
    else if (err.code === "GROUND_CLOSED") setFormError({ message: "Sorry, the ground is closed on that day.", slotTaken: true });
    else setFormError({ message: err.message, slotTaken: false });
  };

  const totalMinor = options.data ? slotsSubtotal(slots) + options.data.serviceFee : null;
  const total = totalMinor === null ? null : takaLabel(totalMinor);
  const depositMinor = totalMinor !== null && depositPercent !== null ? cashDepositAmount(totalMinor, depositPercent) : null;
  const bookingMoney = totalMinor !== null && depositMinor !== null && depositPercent !== null
    ? { deposit: takaLabel(depositMinor), balance: takaLabel(totalMinor - depositMinor), percent: depositPercent }
    : undefined;
  // Booking money needs a wallet to send it to; turf-api hides cash otherwise, this guards a stale page.
  const noDepositWallet = bookingMoneyOn && !depositWallet;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-6 rounded-2xl border bg-card p-4 sm:p-6">
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
            id="customerEmail" label={session ? "Email (optional)" : "Email"} type="email" autoComplete="email" className="sm:col-span-2"
            hint={session
              ? "Your confirmation link will be sent here. No email: no confirmation emails; find your bookings under My bookings."
              : "Your confirmation link will be sent here."}
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
            depositPercent={depositPercent}
          />
        )}
        {/* Signed out, cash and wallets ask to sign in first, before any TrxID is typed (it would be lost on the way). */}
        {needsSignIn
          ? !sessionPending && <SignInNotice href={signInHref} />
          : noDepositWallet
            ? <p role="alert" className="mt-4 text-sm text-destructive">Booking money can&apos;t be paid right now. Please choose another payment method or call the venue.</p>
            : payWallet && !exceedsSlotLimit && (
              <>
                {bookingMoneyOn && <DepositWalletPicker wallets={wallets} value={payWallet.method} onChange={setDepositChoice} />}
                <WalletFields
                  method={payWallet.method} number={payWallet.number} total={total}
                  bookingMoney={bookingMoneyOn ? bookingMoney : undefined} register={register} errors={errors}
                />
              </>
            )}
        {errors.paymentMethod && <p className="mt-1 text-xs text-destructive">{errors.paymentMethod.message}</p>}
      </div>

      <div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="h-5 w-5 shrink-0 accent-primary" {...register("acceptTerms")} />
          <span>
            I agree to the venue&apos;s booking and cancellation rules.
          </span>
        </label>
        {errors.acceptTerms && <p className="mt-1 text-xs text-destructive">{errors.acceptTerms.message}</p>}
      </div>

      {!options.isPending && exceedsSlotLimit && (
        <p role="alert" className="text-sm text-destructive">
          You can book up to {maxSlots} slots at a time.{" "}
          <Link href={`/grounds/${groundId}`} className="font-semibold underline">Pick fewer slots</Link>
        </p>
      )}

      {formError && (
        <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {formError.message}
          {formError.slotTaken && (
            <Link href={`/grounds/${groundId}`} className="ml-1 font-semibold underline">Pick another time</Link>
          )}
          {formError.myBookings && (
            <Link href="/my-bookings" className="ml-1 font-semibold underline">My bookings</Link>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={disabled || busy || !canPay || needsSignIn || exceedsSlotLimit || noDepositWallet}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        {options.data && !canPay
          ? "Online booking unavailable"
          : needsSignIn && !sessionPending ? "Sign in above to continue" : submitLabel(method, total, busy, bookingMoneyOn ? bookingMoney?.deposit : undefined)}
      </button>
    </form>
  );
}

function submitLabel(method: CheckoutMethod, total: string | null, busy: boolean, bookingMoney?: string) {
  if (busy) return method === "card" ? "Taking you to payment…" : "Reserving your slot…";
  if (method === "cash" && bookingMoney) return `Book · I've sent ${bookingMoney} booking money`;
  if (method === "cash") return total ? `Reserve · pay ${total} at the venue` : "Reserve slot";
  if (method !== "card") return total ? `Book · I've sent ${total}` : "Book slot";
  return total ? `Continue to pay ${total}` : "Continue to payment";
}
