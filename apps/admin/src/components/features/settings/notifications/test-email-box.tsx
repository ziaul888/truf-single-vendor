"use client";

import { useState, type FormEvent } from "react";
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
  EMAIL_NOT_CONFIGURED: "Email delivery needs setup. Check the Email sender section and try again.",
  TOO_MANY_ATTEMPTS: "You can send 5 test emails an hour. Please try again later.",
};

function testEmailError(err: unknown): string {
  const failure = toApiFailure(err);
  return (failure.code && TEST_EMAIL_ERRORS[failure.code]) || failure.error;
}

/** Sends one test email (5 an hour per user) and shows the result in the log. */
export function TestEmailBox({ configured }: { configured: boolean }) {
  const send = useSendTestEmail();
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || send.isPending) return;
    const address = to.trim();
    if (address && !RecipientSchema.safeParse(address).success) return setError("Enter a valid email");
    setError(null);
    try {
      await send.mutateAsync(address || undefined);
      toast.success(`Test email accepted for ${address || "your account"}.`);
    } catch (err) {
      toast.error(testEmailError(err));
    }
  }

  return (
    <SettingsSection
      title="Send a test email"
      icon={Send}
      description={configured ? "At most 5 an hour." : "Set up email delivery before sending a test."}
    >
      <form noValidate onSubmit={onSend} className="space-y-1.5">
        <Label htmlFor="test-email-to">Send to</Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id="test-email-to"
            type="email"
            disabled={!configured}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "test-email-error" : undefined}
            placeholder="Leave blank to send to yourself"
            value={to}
            onChange={(e) => { setTo(e.target.value); setError(null); }}
            className={cn("max-w-xs", error && "border-destructive")}
          />
          <Button type="submit" variant="outline" size="sm" disabled={!configured || send.isPending}>
            {send.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
            {send.isPending ? "Sending…" : "Send test email"}
          </Button>
        </div>
        {error && <p id="test-email-error" role="alert" className="text-xs text-destructive">{error}</p>}
      </form>
    </SettingsSection>
  );
}
