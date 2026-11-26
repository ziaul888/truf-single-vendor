"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { PortalApiError } from "@/lib/portal-bookings";

export const CODE_INPUT =
  "mt-1 min-h-11 w-full rounded-lg border bg-background px-3 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive";
export const CODE_BUTTON =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60";

export function codeError(error: unknown) {
  if (!(error instanceof PortalApiError)) return "Something went wrong. Please try again.";
  if (error.code === "SMS_PROVIDER_ERROR") return "We couldn't send the code. Try again shortly.";
  return error.details?.[0]?.message ?? error.message;
}

export function VerificationCodeForm({
  email,
  instruction,
  submitLabel,
  changeLabel,
  onChangeRecipient,
  onResend,
  onVerify,
}: {
  email: boolean;
  instruction: ReactNode;
  submitLabel: string;
  changeLabel: string;
  onChangeRecipient: () => void;
  onResend: () => Promise<unknown>;
  onVerify: (code: string) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [wait, setWait] = useState(60);
  const [sending, setSending] = useState(false);
  const form = useForm({ defaultValues: { code: "" } });
  const checking = form.formState.isSubmitting;
  const busy = checking || sending;

  useEffect(() => {
    if (wait === 0) return;
    const timer = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  async function resend() {
    setSending(true);
    setError(null);
    try {
      await onResend();
      form.reset({ code: "" });
      setWait(60);
      form.setFocus("code");
    } catch (err) {
      setError(codeError(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={form.handleSubmit(async ({ code }) => {
        setError(null);
        try {
          await onVerify(code.trim());
        } catch (err) {
          setError(codeError(err));
        }
      })}
    >
      <div className="space-y-1 text-sm">
        <p className="wrap-anywhere">{instruction}</p>
        <button
          type="button"
          disabled={busy}
          onClick={onChangeRecipient}
          className="text-accent min-h-11 text-left font-semibold hover:underline disabled:opacity-60"
        >
          {changeLabel}
        </button>
      </div>
      <div>
        <label htmlFor="customer-code" className="text-sm font-semibold">
          Verification code
        </label>
        <input
          id="customer-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={email ? 6 : 10}
          autoFocus
          aria-invalid={!!form.formState.errors.code}
          aria-describedby={form.formState.errors.code ? "customer-code-error" : undefined}
          className={`${CODE_INPUT} tracking-[0.25em]`}
          {...form.register("code", {
            validate: (code) =>
              (email ? /^\d{6}$/ : /^\d{4,10}$/).test(code.trim()) ||
              (email
                ? "Enter the six-digit code from your email"
                : "Enter the code from your text message"),
          })}
        />
        {form.formState.errors.code && (
          <p id="customer-code-error" className="text-destructive mt-1 text-sm">
            {form.formState.errors.code.message}
          </p>
        )}
      </div>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className={CODE_BUTTON}>
        {checking && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {submitLabel}
      </button>
      <button
        type="button"
        disabled={wait > 0 || busy}
        onClick={resend}
        className="text-accent disabled:text-muted-foreground min-h-11 w-full text-center text-sm font-medium hover:underline disabled:no-underline"
      >
        {sending ? "Sending…" : wait > 0 ? `Resend code in ${wait}s` : "Resend code"}
      </button>
    </form>
  );
}
