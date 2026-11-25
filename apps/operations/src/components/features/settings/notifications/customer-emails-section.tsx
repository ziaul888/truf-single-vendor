"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Lock, Users } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { SettingToggle } from "@/components/features/slots/setting-fields";
import { SettingsSection } from "@/components/features/settings/settings-section";
import type { NotificationsForm } from "@/validations/notifications";

/** A switch that is always on: these emails can't be turned off. */
function LockedToggle({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Lock className="h-3 w-3" /> Always sent</span>
        <Switch checked disabled aria-label={`${label}: always sent`} className="mt-0.5" />
      </div>
    </div>
  );
}

export function CustomerEmailsSection({ form }: { form: UseFormReturn<NotificationsForm> }) {
  return (
    <SettingsSection title="Customer emails" icon={Users} description="Emails customers get about their bookings">
      <LockedToggle label="Booking confirmed" desc="Booking details and the cancel link, once a booking is confirmed" />
      <LockedToggle label="Booking cancelled" desc="Sent whenever a booking is cancelled, by staff or the customer" />
      <Controller
        control={form.control}
        name="customer.refundIssued"
        render={({ field }) => (
          <SettingToggle label="Refund issued" desc="Tells the customer a refund is on its way" checked={field.value} onChange={field.onChange} />
        )}
      />
      <Controller
        control={form.control}
        name="customer.slotBlocked"
        render={({ field }) => (
          <SettingToggle
            label="Slot blocked"
            desc="When staff block a booked slot (also in slot settings as “Notify customer on slot blocked”)"
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </SettingsSection>
  );
}
