"use client";

import Link from "next/link";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Clock, DollarSign, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SlotSettingsForm } from "@/validations/slot-settings";
import { NumberSetting, SettingToggle } from "./setting-fields";

type Form = UseFormReturn<SlotSettingsForm>;

function RuleCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

/** Booking window and automatic slot generation. */
export function GenerationSettingsCard({ form }: { form: Form }) {
  return (
    <RuleCard title="Generation settings" icon={Clock}>
      <NumberSetting
        id="advanceBookingDays"
        label="Advance booking window"
        unit="days ahead"
        min={1}
        max={365}
        hint="How far ahead customers can book, and how far ahead slots are created."
        error={form.formState.errors.advanceBookingDays?.message}
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
    </RuleCard>
  );
}

/** Cancellation cutoff, plus what blocking a slot does. */
export function BookingBehaviourCard({ form }: { form: Form }) {
  return (
    <RuleCard title="Booking behaviour" icon={Shield}>
      <NumberSetting
        id="cancellationCutoffHours"
        label="Cancellation cutoff"
        unit="hours before slot"
        max={72}
        hint="Customers can't book or cancel within this window."
        error={form.formState.errors.cancellationCutoffHours?.message}
        registration={form.register("cancellationCutoffHours")}
      />
      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-700 dark:text-amber-400 space-y-1">
        <p>· Blocking a booked slot cancels its booking with a full refund.</p>
        <p>· Unblocking a slot makes it bookable again straight away.</p>
        <p>· Slots that have already started can&apos;t be blocked or unblocked.</p>
      </div>
    </RuleCard>
  );
}

/** Points to the grounds: hours, slot length and prices are set per ground. */
export function PerGroundSettingsCard() {
  return (
    <RuleCard title="Pricing & slot length" icon={DollarSign}>
      <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground text-sm">Set on each ground</p>
        <p>· Opening hours, slot length (1 or 2 hours) and hourly price</p>
        <p>· Optional peak price and peak time ranges</p>
        <p>· A slot&apos;s price is fixed when the slot is created</p>
      </div>
      <Button type="button" variant="outline" size="sm" asChild>
        <Link href="/dashboard/grounds">Edit grounds</Link>
      </Button>
    </RuleCard>
  );
}
