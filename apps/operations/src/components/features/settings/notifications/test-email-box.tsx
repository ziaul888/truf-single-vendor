"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSendTestEmail } from "@/hooks/useSettings";
import { toApiFailure } from "@/lib/api-error";
import { SettingsSection } from "@/components/features/settings/settings-section";
import { RecipientSchema } from "@/validations/notifications";

const TEST_EMAIL_ERRORS: Record<string, string> = {
  EMAIL_NOT_CONFIGURED: "SendGrid isn't set up yet. Set SENDGRID_API_KEY in turf-api's .env, then try again.",
  TOO_MANY_ATTEMPTS: "You can send 5 test emails an hour. Please try again later.",
};

function testEmailError(err: unknown): string {
  const failure = toApiFailure(err);
  if (failure.code === "EMAIL_PROVIDER_ERROR") return `SendGrid refused the email: ${failure.error}`;
  return (failure.code && TEST_EMAIL_ERRORS[failure.code]) || failure.error;
}

/** Sends one test email (5 an hour per user) and shows the result in the log. */
export function TestEmailBox() {
  const send = useSendTestEmail();
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSend() {
    const address = to.trim();
    if (address && !RecipientSchema.safeParse(address).success) return setError("Enter a valid email");
    try {
      await send.mutateAsync(address || undefined);
      toast.success(`Test email sent to ${address || "you"}`);
    } catch (err) {
      toast.error(testEmailError(err));
    }
  }

  return (
    <SettingsSection title="Send a test email" icon={Send} description="Check that emails arrive. At most 5 an hour.">
      <div className="space-y-1.5">
        <Label htmlFor="test-email-to">Send to</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id="test-email-to"
            type="email"
            placeholder="Leave blank to send to yourself"
            value={to}
            onChange={(e) => { setTo(e.target.value); setError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSend(); } }}
            className={cn("max-w-xs", error && "border-destructive")}
          />
          <Button type="button" variant="outline" size="sm" onClick={onSend} disabled={send.isPending}>
            {send.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
            {send.isPending ? "Sending…" : "Send test email"}
          </Button>
        </div>
        {error && <p className="text-[11px] text-destructive">{error}</p>}
      </div>
    </SettingsSection>
  );
}
