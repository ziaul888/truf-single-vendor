"use client";

import Link from "next/link";
import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, Bell, Loader2 } from "lucide-react";
import { useSlotSettings } from "@/hooks/useSlots";
import { useSlotSettingsForm } from "@/hooks/useSlotSettingsForm";
import { useMe } from "@/hooks/useMe";
import { SettingToggle } from "@/components/features/slots/setting-fields";
import { PortalCheckoutSettings } from "@/components/features/slots/portal-checkout-settings";
import {
  BookingBehaviourCard, GenerationSettingsCard, PerGroundSettingsCard,
} from "@/components/features/slots/booking-rule-cards";

// Venue-wide settings. Hours, slot length and prices are per ground (edit them on the ground).
export default function SlotSettingsPage() {
  const { data: settings, isLoading } = useSlotSettings();
  const { data: me } = useMe();
  const canEdit = me?.role === "admin";
  const { form, submit, saving } = useSlotSettingsForm(settings);
  const { isDirty } = form.formState;

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/dashboard/slots" className="mb-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit">
            <ChevronLeft className="h-4 w-4" /> Back to slots
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Slot settings</h1>
          <p className="text-sm text-muted-foreground">Booking window, slot generation, checkout and notifications for every ground</p>
        </div>
        {canEdit && (
          <Button type="submit" disabled={saving || !isDirty}>
            <Save className="mr-1.5 h-4 w-4" />
            {saving ? "Saving…" : "Save settings"}
          </Button>
        )}
      </div>

      <fieldset disabled={!canEdit} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <GenerationSettingsCard form={form} />
        <PerGroundSettingsCard />
        <BookingBehaviourCard form={form} />
        <PortalCheckoutSettings form={form} />

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
    </form>
  );
}
