"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTurfPortal } from "@/components/portal/turf-portal-scope";
import { sendEmailCode, verifyEmailCode } from "@/lib/portal-bookings";
import type { CustomerSession } from "@/types/booking";
import { customerSessionKey } from "./use-customer-session";
import { CODE_BUTTON, VerificationCodeForm, codeError } from "./verification-code-form";

export function SignInEmail({ session }: { session: CustomerSession }) {
  const slug = useTurfPortal()?.slug;
  const cache = useQueryClient();
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const email = session.email?.trim().toLowerCase();
  const canLink = email && email !== session.verifiedEmail && session.signInMethod !== "email";

  async function send(address: string) {
    setSending(true);
    setError(null);
    try {
      await sendEmailCode("link", address, slug);
      setRecipient(address);
    } catch (err) {
      setError(codeError(err));
    } finally {
      setSending(false);
    }
  }

  async function verify(code: string) {
    const updated = await verifyEmailCode("link", recipient, code, slug);
    cache.setQueryData(customerSessionKey(slug), updated);
    setRecipient("");
    toast.success("Sign-in email verified");
  }

  return (
    <section className="bg-card space-y-3 rounded-2xl border p-6" aria-labelledby="sign-in-email">
      <h2 id="sign-in-email" className="font-bold">
        Sign-in email
      </h2>
      {session.verifiedEmail && (
        <p className="text-sm wrap-anywhere">
          <strong>{session.verifiedEmail}</strong> · Verified
        </p>
      )}
      {recipient && canLink && recipient === email ? (
        <VerificationCodeForm
          email
          instruction={
            <>
              Enter the code sent to <strong>{recipient}</strong>.
            </>
          }
          submitLabel="Verify email"
          changeLabel="Cancel verification"
          onChangeRecipient={() => setRecipient("")}
          onResend={() => sendEmailCode("link", recipient, slug)}
          onVerify={verify}
        />
      ) : canLink ? (
        <>
          <p className="text-muted-foreground text-sm wrap-anywhere">
            Verify {email} to use it when signing in.
          </p>
          <button
            type="button"
            disabled={sending}
            className={CODE_BUTTON}
            onClick={() => void send(email)}
          >
            {sending && <Loader2 className="size-4 animate-spin" aria-hidden />}
            {sending ? "Sending…" : "Send verification code"}
          </button>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
        </>
      ) : session.signInMethod === "email" && session.phone ? (
        <p className="text-muted-foreground text-sm">
          Sign in with your phone to change your sign-in email.
        </p>
      ) : (
        !session.verifiedEmail && (
          <p className="text-muted-foreground text-sm">
            Save an email in Personal details to verify it for sign-in.
          </p>
        )
      )}
    </section>
  );
}
