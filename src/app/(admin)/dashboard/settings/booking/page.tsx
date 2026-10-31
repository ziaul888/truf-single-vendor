"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { useSlotSettings } from "@/hooks/useSlots";
import { useSlotSettingsForm } from "@/hooks/useSlotSettingsForm";
import { useMe } from "@/hooks/useMe";
import { SettingsPageHeader } from "@/components/features/settings/settings-page-header";
import { ReadOnlyNotice } from "@/components/features/settings/read-only-notice";
import { SettingsLoadError, SettingsLoading } from "@/components/features/settings/settings-load-state";
import { SettingsSaveActions } from "@/components/features/settings/settings-save-actions";
import { BookingBehaviourCard, GenerationSettingsCard } from "@/components/features/slots/booking-rule-cards";
import { PortalCheckoutSettings } from "@/components/features/slots/portal-checkout-settings";
import type { SlotSettingsInput } from "@/validations/slot-settings";

// The same live settings as Slots → Settings. The notify switches are on the Notifications page.
const BOOKING_FIELDS = [
  "advanceBookingDays", "cancellationCutoffHours", "autoGenerate", "holdMinutes", "serviceFee", "portalCashEnabled",
] as const satisfies readonly (keyof SlotSettingsInput)[];

export default function BookingSettingsPage() {
  const { data: settings, isLoading, isError, refetch } = useSlotSettings();
  const { data: me } = useMe();
  const canEdit = me?.role === "admin";
  const { form, submit, discard, saving } = useSlotSettingsForm(settings, BOOKING_FIELDS);

  if (isLoading) return <SettingsLoading />;
  if (isError || !settings) return <SettingsLoadError what="booking settings" onRetry={() => refetch()} />;

  return (
    <form onSubmit={submit} className="space-y-5">
      <SettingsPageHeader title="Booking" description="Booking window, cancellations and portal checkout" audit={settings}>
        {canEdit && <SettingsSaveActions dirty={form.formState.isDirty} saving={saving} onDiscard={discard} />}
      </SettingsPageHeader>
      {!canEdit && <ReadOnlyNotice />}

      <p className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Slot length, opening hours and peak pricing are set on each ground.{" "}
          <Link href="/dashboard/grounds" className="font-medium text-foreground underline underline-offset-2">Edit grounds</Link>
        </span>
      </p>

      <fieldset disabled={!canEdit || saving} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <GenerationSettingsCard form={form} />
        <BookingBehaviourCard form={form} />
        <PortalCheckoutSettings form={form} />
      </fieldset>
    </form>
  );
}
