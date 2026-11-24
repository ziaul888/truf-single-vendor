"use client";

import { DashboardBackLink, DashboardPageHeader } from "@/components/features/dashboard/page-header";
import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Bell, Loader2 } from "lucide-react";
import { useSlotSettings } from "@/hooks/useSlots";
import { useSlotSettingsForm } from "@/hooks/useSlotSettingsForm";
import { useMe } from "@/hooks/useMe";
import { useDashboardAudience } from "@/components/dashboard-audience";
import { SettingsLoadError } from "@/components/features/settings/settings-load-state";
import { SettingsSaveBar } from "@/components/features/settings/settings-save-actions";
import { SettingToggle } from "@/components/features/slots/setting-fields";
import { MultiSlotSettings } from "@/components/features/slots/multi-slot-settings";
import { PortalCheckoutSettings } from "@/components/features/slots/portal-checkout-settings";
import {
  BookingBehaviourCard, GenerationSettingsCard, PerGroundSettingsCard,
} from "@/components/features/slots/booking-rule-cards";

// Venue-wide settings. Hours, slot length and prices are per ground (edit them on the ground).
export default function SlotSettingsPage() {
  const { data: settings, isLoading, isError, refetch } = useSlotSettings();
  const audience = useDashboardAudience();
  const { data: me } = useMe(audience);
  const canEdit = me?.role === "admin" || me?.role === "owner";
  const { form, submit, saving } = useSlotSettingsForm(settings);
  const { isDirty } = form.formState;

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !settings) return <SettingsLoadError what="slot settings" onRetry={() => refetch()} />;

  return (
    <form onSubmit={submit} className="space-y-5">
      <DashboardPageHeader
        title="Slot settings"
        description="Set the booking window, slot generation, checkout and notifications."
        back={<DashboardBackLink href="/dashboard/slots">Back to slots</DashboardBackLink>}
      >
        {canEdit && (
          <Button type="submit" className="hidden lg:inline-flex" disabled={saving || !isDirty}>
            <Save /> {saving ? "Saving…" : "Save settings"}
          </Button>
        )}
      </DashboardPageHeader>

      <fieldset disabled={!canEdit} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <GenerationSettingsCard form={form} />
        <PerGroundSettingsCard />
        <BookingBehaviourCard form={form} />
        <PortalCheckoutSettings form={form} />
        <MultiSlotSettings form={form} />

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              control={form.control}
              name="notifyCustomerOnBlock"
              render={({ field }) => (
                <SettingToggle
                  label="Notify customer on slot blocked"
                  desc="Send email when their booked slot gets blocked by admin"
                  checked={!!field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={form.control}
              name="notifyAdminOnBooking"
              render={({ field }) => (
                <SettingToggle
                  label="Notify admin on new booking"
                  desc="Admin receives email whenever a slot is booked"
                  checked={!!field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              Saved now; emails start once email sending is set up.
            </div>
          </CardContent>
        </Card>
      </fieldset>
      {!canEdit && <p className="text-xs text-muted-foreground">Only admins can change slot settings.</p>}
      {canEdit && (
        <SettingsSaveBar visible={isDirty || saving}>
          <Button type="submit" disabled={saving || !isDirty}>
            <Save className="mr-1.5 h-4 w-4" />
            {saving ? "Saving…" : "Save settings"}
          </Button>
        </SettingsSaveBar>
      )}
    </form>
  );
}
