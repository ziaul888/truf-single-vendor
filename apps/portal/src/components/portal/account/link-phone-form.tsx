"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useTurfPortal } from "@/components/portal/turf-portal-scope";
import { sendSignInCode, verifyPhoneLink } from "@/lib/portal-bookings";
import { customerBookingsKey, customerSessionKey } from "./use-customer-session";
import { CODE_BUTTON, CODE_INPUT, VerificationCodeForm, codeError } from "./verification-code-form";

export function LinkPhoneForm() {
  const slug = useTurfPortal()?.slug;
  const cache = useQueryClient();
  const phoneId = useId();
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState<string | null>(null);
  const form = useForm({ defaultValues: { phone: "" } });
  const busy = form.formState.isSubmitting;
  const fieldError = form.formState.errors.phone;

  async function send(phone: string) {
    setError(null);
    try {
      await sendSignInCode(phone.trim(), slug);
      setRecipient(phone.trim());
    } catch (err) {
      setError(codeError(err));
    }
  }

  async function verify(code: string) {
    const session = await verifyPhoneLink(recipient, code, slug);
    cache.setQueryData(customerSessionKey(slug), session);
    void cache.invalidateQueries({ queryKey: customerBookingsKey(slug) });
  }

  return (
    <section className="space-y-3">
      <h2 className="font-bold">Verify your mobile number</h2>
      {recipient ? (
        <VerificationCodeForm
          email={false}
          instruction={
            <>
              We sent a code to <strong>{recipient}</strong>.
            </>
          }
          submitLabel="Verify number"
          changeLabel="Change number"
          onChangeRecipient={() => setRecipient("")}
          onResend={() => sendSignInCode(recipient, slug)}
          onVerify={verify}
        />
      ) : (
        <form
          noValidate
          className="space-y-3"
          onSubmit={form.handleSubmit(({ phone }) => send(phone))}
        >
          <p className="text-muted-foreground text-sm">
            Use your verified number to book a slot and find bookings made with that number.
          </p>
          <div>
            <label htmlFor={phoneId} className="text-sm font-semibold">
              Mobile number
            </label>
            <input
              id={phoneId}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              disabled={busy}
              className={CODE_INPUT}
              aria-invalid={!!fieldError}
              aria-describedby={fieldError ? `${phoneId}-error` : undefined}
              {...form.register("phone", {
                validate: (value) =>
                  value.replace(/\D/g, "").length >= 10 || "Enter your mobile number",
              })}
            />
            {fieldError && (
              <p id={`${phoneId}-error`} className="text-destructive mt-1 text-sm">
                {fieldError.message}
              </p>
            )}
          </div>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className={CODE_BUTTON}>
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {busy ? "Sending…" : "Send text code"}
          </button>
        </form>
      )}
    </section>
  );
}
