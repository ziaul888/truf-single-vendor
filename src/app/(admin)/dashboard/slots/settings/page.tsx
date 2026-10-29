"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, Clock, DollarSign, Bell, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSlotSettings, useUpdateSlotSettings } from "@/hooks/useSlots";
import { useMe } from "@/hooks/useMe";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import { NumberSetting, SettingToggle } from "@/components/features/slots/setting-fields";
import { PortalCheckoutSettings } from "@/components/features/slots/portal-checkout-settings";
import {
  SlotSettingsSchema, fromSlotSettingsForm, toSlotSettingsForm, type SlotSettingsForm,
} from "@/validations/slot-settings";

// Venue-wide settings. Hours, slot length and prices are per ground (edit them on the ground).
export default function SlotSettingsPage() {
  const { data: settings, isLoading } = useSlotSettings();
  const save = useUpdateSlotSettings();
  const { data: me } = useMe();
  const canEdit = me?.role === "admin";

  const form = useForm<SlotSettingsForm>({
    // z.coerce widens the schema's input type; the form's values are always numbers here.
    resolver: zodResolver(SlotSettingsSchema) as Resolver<SlotSettingsForm>,
  });
  const { errors, isDirty } = form.formState;

  useEffect(() => {
    if (settings) form.reset(toSlotSettingsForm(settings));
  }, [settings, form]);

  async function onSubmit(values: SlotSettingsForm) {
    try {
      const saved = await save.mutateAsync(fromSlotSettingsForm(values));
      form.reset(toSlotSettingsForm(saved));
      toast.success("Slot settings saved");
    } catch (err) {
      const failure = toApiFailure(err);
      if (!applyApiErrors(form, failure)) toast.error(failure.error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
          <Button type="submit" disabled={save.isPending || !isDirty}>
            <Save className="mr-1.5 h-4 w-4" />
            {save.isPending ? "Saving…" : "Save settings"}
          </Button>
        )}
      </div>

      <fieldset disabled={!canEdit} className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Generation settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> Generation settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NumberSetting
              id="advanceBookingDays"
              label="Advance booking window"
              unit="days ahead"
              max={365}
              hint="How far ahead customers can book, and how far ahead slots are created."
              error={errors.advanceBookingDays?.message}
              registration={form.register("advanceBookingDays")}
            />
            <Controller
              control={form.control}
              name="autoGenerate"
              render={({ field }) => (
                <SettingToggle
                  label="Auto-generate slots"
                  desc="Keeps slots created up to the booking window. Runs at startup and then hourly."
                  checked={!!field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <p className="text-[11px] text-muted-foreground">Existing slots are never overwritten when slots are generated.</p>
          </CardContent>
        </Card>

        {/* Pricing & slot length now live on each ground */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" /> Pricing &amp; slot length
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground text-sm">Set on each ground</p>
              <p>· Opening hours, slot length (1 or 2 hours) and hourly price</p>
              <p>· Optional peak price and peak time ranges</p>
              <p>· A slot&apos;s price is fixed when the slot is created</p>
            </div>
            <Button type="button" variant="outline" size="sm" asChild>
              <Link href="/dashboard/grounds">Edit grounds</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Booking behaviour */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" /> Booking behaviour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NumberSetting
              id="cancellationCutoffHours"
              label="Cancellation cutoff"
              unit="hours before slot"
              max={72}
              hint="Customers can't book or cancel within this window."
              error={errors.cancellationCutoffHours?.message}
              registration={form.register("cancellationCutoffHours")}
            />
            <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-700 dark:text-amber-400 space-y-1">
              <p>· Blocking a booked slot cancels its booking with a full refund.</p>
              <p>· Unblocking a slot makes it bookable again straight away.</p>
              <p>· Slots that have already started can&apos;t be blocked or unblocked.</p>
            </div>
          </CardContent>
        </Card>

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
