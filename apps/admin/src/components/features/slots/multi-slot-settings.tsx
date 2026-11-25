"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SlotSettingsForm } from "@/validations/slot-settings";
import { SettingToggle } from "./setting-fields";

const SLOT_LIMITS = [2, 3, 4] as const;

/** Lets admins allow several slots of one ground and date in one booking, and sets the limit. */
export function MultiSlotSettings({ form: f }: { form: UseFormReturn<SlotSettingsForm> }) {
  const enabled = f.watch("multiSlotEnabled");
  const error = f.formState.errors.maxSlotsPerBooking?.message;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" /> Multiple slots
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Controller
          control={f.control}
          name="multiSlotEnabled"
          render={({ field }) => (
            <SettingToggle
              label="Allow multiple slots per booking"
              desc="Customers and staff can add several slots of one ground and date to one booking. One booking number, one payment, one service fee. Off by default."
              checked={!!field.value}
              onChange={field.onChange}
            />
          )}
        />
        {enabled && (
          <div className="space-y-1.5">
            <Label htmlFor="maxSlotsPerBooking">Maximum slots per booking</Label>
            <Controller
              control={f.control}
              name="maxSlotsPerBooking"
              render={({ field }) => (
                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                  <SelectTrigger id="maxSlotsPerBooking" className={cn("w-full", error && "border-destructive")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SLOT_LIMITS.map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} slots</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {error ? (
              <p className="text-[11px] text-destructive">{error}</p>
            ) : (
              <p className="text-[11px] text-muted-foreground">The most slots one booking can hold (2–4).</p>
            )}
          </div>
        )}
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-700 dark:text-amber-400">
          Before turning this on for the first time: make sure no old API server is still running and the one-time
          repair (<code className="font-mono">yarn db:reconcile:booking-slots</code>) has been run once. Existing
          multi-slot bookings keep working when this is off. Changes reach the booking forms within a minute.
        </div>
      </CardContent>
    </Card>
  );
}
