"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Smartphone } from "lucide-react";
import { PortalApiError, sendSignInCode, verifySignInCode } from "@/lib/portal-bookings";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { CUSTOMER_SESSION_KEY } from "./use-customer-session";
import { ProfileStep } from "./profile-step";

const RESEND_AFTER_S = 60;

const PhoneSchema = z.object({
  phone: z.string().trim().refine((v) => v.replace(/\D/g, "").length >= 10, "Enter your mobile number"),
});
const CodeSchema = z.object({ code: z.string().trim().regex(/^\d{4,10}$/, "Enter the code from the SMS") });

const INPUT =
  "mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive";
const BUTTON =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60";

/** Turns turf-api's codes into what the customer should do next. */
function messageFor(err: unknown) {
  if (!(err instanceof PortalApiError)) return "Something went wrong. Please try again.";
  if (err.code === "INVALID_CODE") return "Wrong code. Check the SMS and try again, or resend the code.";
  if (err.code === "SMS_PROVIDER_ERROR") return "We couldn't send the code. Try again shortly.";
  return err.details?.[0]?.message ?? err.message;
}

/** Phone → SMS code → signed in. Returns to ?from= (same-site paths only). */
export function SignInForm() {
  const router = useRouter();
  const from = safeRedirectPath(useSearchParams().get("from"), "/my-bookings");
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wait, setWait] = useState(0);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const phoneForm = useForm<z.infer<typeof PhoneSchema>>({ resolver: zodResolver(PhoneSchema), defaultValues: { phone: "" } });
  const codeForm = useForm<z.infer<typeof CodeSchema>>({ resolver: zodResolver(CodeSchema), defaultValues: { code: "" } });

  async function send(number: string) {
    setError(null);
    try {
      await sendSignInCode(number);
      setPhone(number);
      setWait(RESEND_AFTER_S);
      codeForm.reset({ code: "" });
    } catch (err) {
      setError(messageFor(err));
    }
  }

  async function verify({ code }: { code: string }) {
    if (!phone) return;
    setError(null);
    try {
      const session = await verifySignInCode(phone, code);
      queryClient.setQueryData(CUSTOMER_SESSION_KEY, session);
      if (session.needsProfile) setNeedsProfile(true);
      else finish();
    } catch (err) {
      setError(messageFor(err));
    }
  }

  function finish() {
    router.replace(from);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border bg-card p-6 text-left">
      {needsProfile ? (
        <ProfileStep onDone={finish} />
      ) : phone === null ? (
        <form onSubmit={phoneForm.handleSubmit(({ phone: p }) => send(p))} noValidate className="space-y-4">
          <div>
            <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mobile number</label>
            <input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01711 000000"
              aria-invalid={!!phoneForm.formState.errors.phone} className={INPUT} {...phoneForm.register("phone")} />
            {phoneForm.formState.errors.phone && <p className="mt-1 text-xs text-destructive">{phoneForm.formState.errors.phone.message}</p>}
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={phoneForm.formState.isSubmitting} className={BUTTON}>
            {phoneForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />}
            Send code
          </button>
        </form>
      ) : (
        <form onSubmit={codeForm.handleSubmit(verify)} noValidate className="space-y-4">
          <p className="text-sm">
            We sent a code to <strong>{phone}</strong>.{" "}
            <button type="button" onClick={() => { setPhone(null); setError(null); }} className="font-semibold text-accent underline">Change number</button>
          </p>
          <div>
            <label htmlFor="code" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Code</label>
            <input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={10} autoFocus
              aria-invalid={!!codeForm.formState.errors.code} className={`${INPUT} tracking-[0.4em]`} {...codeForm.register("code")} />
            {codeForm.formState.errors.code && <p className="mt-1 text-xs text-destructive">{codeForm.formState.errors.code.message}</p>}
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={codeForm.formState.isSubmitting} className={BUTTON}>
            {codeForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
          <button type="button" disabled={wait > 0} onClick={() => send(phone)}
            className="w-full text-center text-sm font-medium text-accent hover:underline disabled:text-muted-foreground disabled:no-underline">
            {wait > 0 ? `Resend code in ${wait}s` : "Resend code"}
          </button>
        </form>
      )}
    </div>
  );
}
