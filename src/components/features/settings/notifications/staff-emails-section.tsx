"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { BellRing } from "lucide-react";
import { SettingToggle } from "@/components/features/slots/setting-fields";
import { SettingsSection } from "@/components/features/settings/settings-section";
import type { NotificationsForm } from "@/validations/notifications";
import { RecipientsInput } from "./recipients-input";

type StaffSwitch = "staff.newBooking" | "staff.customerCancelled" | "staff.dueDigest";

const SWITCHES: { name: StaffSwitch; label: string; desc: string }[] = [
  { name: "staff.newBooking", label: "New booking", desc: "Whenever a slot is booked (also in slot settings as “Notify admin on new booking”)" },
  { name: "staff.customerCancelled", label: "Customer cancelled", desc: "When a customer cancels through the link in their email" },
  {
    name: "staff.dueDigest",
    label: "Due payments digest",
    desc: "One email from 09:00 venue time listing overdue and due-today bookings. Skipped when there are none.",
  },
];

export function StaffEmailsSection({ form }: { form: UseFormReturn<NotificationsForm> }) {
  const recipientErrors = form.formState.errors.staff?.recipients;
  const itemErrors = Array.isArray(recipientErrors) ? recipientErrors.map((e) => e?.message) : [];

  return (
    <SettingsSection title="Staff emails" icon={BellRing} description="Alerts for the venue team">
      <Controller
        control={form.control}
        name="staff.recipients"
        render={({ field }) => (
          <RecipientsInput
            value={field.value}
            onChange={(next) => { form.clearErrors("staff.recipients"); field.onChange(next); }}
            error={recipientErrors?.message ?? recipientErrors?.root?.message}
            itemErrors={itemErrors}
          />
        )}
      />
      <div className="space-y-4 border-t pt-4">
        {SWITCHES.map((s) => (
          <Controller
            key={s.name}
            control={form.control}
            name={s.name}
            render={({ field }) => <SettingToggle label={s.label} desc={s.desc} checked={field.value} onChange={field.onChange} />}
          />
        ))}
      </div>
    </SettingsSection>
  );
}
