"use client";

import type { UseFormReturn } from "react-hook-form";
import { AlertTriangle, CheckCircle2, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SettingsSection } from "@/components/features/settings/settings-section";
import type { NotificationSettings } from "@/types/settings";
import type { NotificationsForm } from "@/validations/notifications";

interface EmailSenderSectionProps {
  form: UseFormReturn<NotificationsForm>;
  email: NotificationSettings["email"];
  showDeliveryStatus: boolean;
}

const PROVIDER_NAMES = { resend: "Resend", sendgrid: "SendGrid" };

function DeliveryStatus({ email }: { email: NotificationSettings["email"] }) {
  const providerName = email.provider ? PROVIDER_NAMES[email.provider] : "Email delivery";
  if (email.configured) {
    return (
      <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
        <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" /> {providerName} is configured.
      </p>
    );
  }
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
      <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-medium">Email delivery needs setup.</p>
        <p className="text-xs">
          Set <code className="font-mono">RESEND_API_KEY</code> and <code className="font-mono">EMAIL_FROM</code> in the Turf API environment, then restart the API.
        </p>
      </div>
    </div>
  );
}

/** Delivery status, the fixed sender address, and the sender name / reply-to overrides. */
export function EmailSenderSection({ form, email, showDeliveryStatus }: EmailSenderSectionProps) {
  const errors = form.formState.errors.email;
  return (
    <SettingsSection title="Email sender" icon={Mail} description="How emails to customers and staff are sent">
      {showDeliveryStatus && <DeliveryStatus email={email} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {email.fromEmail && (
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="fromEmail">From email</Label>
            <Input id="fromEmail" value={email.fromEmail} readOnly aria-describedby="from-email-help" className="max-w-sm" />
            <p id="from-email-help" className="text-xs text-muted-foreground">
              The Turf API sets this address through <code className="font-mono">EMAIL_FROM</code>. Use a sender approved by your email provider.
            </p>
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="fromName">From name</Label>
          <Input id="fromName" maxLength={60} placeholder={email.effectiveFromName} {...form.register("email.fromName")} className={cn(errors?.fromName && "border-destructive")} />
          {errors?.fromName
            ? <p className="text-[11px] text-destructive">{errors.fromName.message}</p>
            : <p className="text-[11px] text-muted-foreground">Leave blank to use the venue name.</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="replyTo">Reply-to email</Label>
          <Input id="replyTo" type="email" placeholder={email.effectiveReplyTo} {...form.register("email.replyTo")} className={cn(errors?.replyTo && "border-destructive")} />
          {errors?.replyTo
            ? <p className="text-[11px] text-destructive">{errors.replyTo.message}</p>
            : <p className="text-[11px] text-muted-foreground">Leave blank to use the venue&apos;s support email (or its email).</p>}
        </div>
      </div>
    </SettingsSection>
  );
}
