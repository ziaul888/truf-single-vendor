"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Smartphone } from "lucide-react";
import { useTurfPortal } from "@/components/portal/turf-portal-scope";
import { turfPortalPath } from "@/lib/turf-portal-path";
import {
  PortalApiError,
  sendEmailCode,
  sendSignInCode,
  verifyEmailCode,
  verifySignInCode,
} from "@/lib/portal-bookings";
import { safeRedirectPath } from "@/lib/safe-redirect";
import type { CustomerSession } from "@/types/booking";
import { customerSessionKey } from "./use-customer-session";
import { ProfileStep } from "./profile-step";
import { CODE_BUTTON, CODE_INPUT, VerificationCodeForm, codeError } from "./verification-code-form";

type SignInMethod = "phone" | "email";
type SignInStep = "address" | "code" | "profile";
type SignInSendError = { message: string; canSwitchToPhone: boolean };

const phoneAddress = z
  .string()
  .trim()
  .refine((value) => value.replace(/\D/g, "").length >= 10, "Enter your mobile number");
const emailAddress = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));

/** Returns the customer to the requested page in the same turf. */
export function SignInForm() {
  const router = useRouter();
  const portal = useTurfPortal();
  const slug = portal?.slug;
  const target = safeRedirectPath(useSearchParams().get("from"), "/my-bookings");
  const home = portal?.homePath ?? "/";
  const sameTurf = target === home || target.startsWith(home + "/");
  const from =
    target === "/"
      ? home
      : turfPortalPath(
          slug,
          slug && target.startsWith("/turf/") && !sameTurf ? "/my-bookings" : target
        );
  const cache = useQueryClient();
  const [method, setMethod] = useState<SignInMethod>("phone");
  const [recipient, setRecipient] = useState("");
  const [needsProfile, setNeedsProfile] = useState(false);
  const byEmail = method === "email";
  const step = needsProfile ? "profile" : recipient ? "code" : "address";

  function send(address: string) {
    return byEmail ? sendEmailCode("sign-in", address, slug) : sendSignInCode(address, slug);
  }

  async function verify(code: string) {
    const session = byEmail
      ? await verifyEmailCode("sign-in", recipient, code, slug)
      : await verifySignInCode(recipient, code, slug);
    completeSignIn(session);
  }

  function completeSignIn(session: CustomerSession) {
    cache.setQueryData(customerSessionKey(slug), session);
    if (session.needsProfile) setNeedsProfile(true);
    else finish();
  }

  function finish() {
    router.replace(from);
    router.refresh();
  }

  return (
    <SignInPanel step={step}>
      {step === "profile" ? (
        <ProfileStep email={byEmail ? recipient : undefined} onDone={finish} />
      ) : step === "code" ? (
        <VerificationCodeForm
          email={byEmail}
          instruction={
            <>
              We sent a code to <strong>{recipient}</strong>.
            </>
          }
          submitLabel="Sign in"
          changeLabel={byEmail ? "Change email or use phone" : "Change number or use email"}
          onChangeRecipient={() => setRecipient("")}
          onResend={() => send(recipient)}
          onVerify={verify}
        />
      ) : (
        <SignInAddressForm
          method={method}
          onMethodChange={setMethod}
          onSend={async (value) => {
            await send(value);
            setRecipient(value);
          }}
        />
      )}
    </SignInPanel>
  );
}

function SignInPanel({ step, children }: { step: SignInStep; children: ReactNode }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!panel || !content) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let height = content.getBoundingClientRect().height;
    let resize: Animation | undefined;
    const observer = new ResizeObserver(() => {
      const nextHeight = content.getBoundingClientRect().height;
      if (height === nextHeight) return;

      // Start from the visible height if the previous change is still animating.
      const currentHeight =
        resize?.playState === "running" ? panel.getBoundingClientRect().height : height;
      height = nextHeight;
      resize?.cancel();
      if (motion.matches || currentHeight === nextHeight) return;

      resize = panel.animate([{ height: `${currentHeight}px` }, { height: `${nextHeight}px` }], {
        duration: 220,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
    });

    observer.observe(content);
    return () => {
      observer.disconnect();
      resize?.cancel();
    };
  }, []);

  return (
    <div className="bg-card rounded-2xl border p-5 text-left sm:p-6">
      <div ref={panelRef} className="overflow-clip [overflow-clip-margin:4px]">
        <div ref={contentRef} className="flow-root">
          <div key={step} className="motion-safe:animate-[page-enter_200ms_ease-out_backwards]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignInAddressForm({
  method,
  onMethodChange,
  onSend,
}: {
  method: SignInMethod;
  onMethodChange: (method: SignInMethod) => void;
  onSend: (value: string) => Promise<void>;
}) {
  const byEmail = method === "email";
  const form = useForm({
    resolver: zodResolver(z.object({ address: byEmail ? emailAddress : phoneAddress })),
    defaultValues: { address: "" },
  });
  const [error, setError] = useState<SignInSendError | null>(null);
  const busy = form.formState.isSubmitting;
  const fieldError = form.formState.errors.address;

  function changeMethod(next: SignInMethod) {
    form.resetField("address");
    setError(null);
    onMethodChange(next);
  }

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={form.handleSubmit(async ({ address }) => {
        setError(null);
        try {
          await onSend(address);
        } catch (err) {
          const code = err instanceof PortalApiError ? err.code : undefined;
          const emailUnavailable = code === "EMAIL_SIGN_IN_UNAVAILABLE";
          setError({
            message: emailUnavailable ? "Email sign-in is temporarily unavailable." : codeError(err),
            canSwitchToPhone: byEmail && (emailUnavailable || code === "EMAIL_CODE_DELIVERY_FAILED"),
          });
        }
      })}
    >
      <fieldset disabled={busy} className="grid grid-cols-2 gap-2">
        <legend className="sr-only">Sign-in method</legend>
        {(
          [
            ["phone", "Phone", Smartphone],
            ["email", "Email", Mail],
          ] as const
        ).map(([value, label, Icon]) => (
          <label key={value} className="cursor-pointer">
            <input
              type="radio"
              name="sign-in-method"
              value={value}
              checked={method === value}
              onChange={() => changeMethod(value)}
              className="peer sr-only"
            />
            <span className="peer-checked:border-primary peer-checked:bg-primary/10 peer-focus-visible:ring-ring flex min-h-11 items-center justify-center gap-2 rounded-lg border px-2 text-sm font-semibold peer-focus-visible:ring-2 motion-safe:transition-colors">
              <Icon className="size-4" aria-hidden />
              {label}
            </span>
          </label>
        ))}
      </fieldset>
      <div>
        <label htmlFor="sign-in-address" className="text-sm font-semibold">
          {byEmail ? "Email address" : "Mobile number"}
        </label>
        <input
          id="sign-in-address"
          type={byEmail ? "email" : "tel"}
          inputMode={byEmail ? "email" : "tel"}
          autoComplete={byEmail ? "email" : "tel"}
          autoCapitalize="none"
          disabled={busy}
          placeholder={byEmail ? "you@example.com" : "01711 000000"}
          aria-invalid={!!fieldError}
          aria-describedby={
            fieldError ? "sign-in-address-error" : byEmail ? "sign-in-email-hint" : undefined
          }
          className={CODE_INPUT}
          {...form.register("address")}
        />
        {fieldError && (
          <p id="sign-in-address-error" className="text-destructive mt-1 text-sm">
            {fieldError.message}
          </p>
        )}
        {byEmail && (
          <p id="sign-in-email-hint" className="text-muted-foreground mt-2 text-sm">
            Use the code sent to your email to sign in or create an account.
          </p>
        )}
      </div>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error.message}
        </p>
      )}
      <button type="submit" disabled={busy} className={CODE_BUTTON}>
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {busy ? "Sending…" : "Send code"}
      </button>
      {error?.canSwitchToPhone && (
        <button
          type="button"
          disabled={busy}
          className="text-accent min-h-11 w-full text-center text-sm font-semibold hover:underline"
          onClick={(event) => {
            const input = event.currentTarget.form?.elements.namedItem("address");
            changeMethod("phone");
            if (input instanceof HTMLInputElement) requestAnimationFrame(() => input.focus());
          }}
        >
          Sign in with a linked phone number
        </button>
      )}
    </form>
  );
}
