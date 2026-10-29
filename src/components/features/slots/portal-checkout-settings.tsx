"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SlotSettingsForm } from "@/validations/slot-settings";
import { NumberSetting, SettingToggle } from "./setting-fields";

/** Hold time, service fee and pay-at-venue for portal (customer) bookings. */
export function PortalCheckoutSettings({ form: f }: { form: UseFormReturn<SlotSettingsForm> }) {
  const { errors } = f.formState;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" /> Portal checkout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <NumberSetting
          id="holdMinutes"
          label="Payment hold"
          unit="minutes"
          min={5}
          max={30}
          hint="Minutes a slot is held while the customer pays (5–30)."
          error={errors.holdMinutes?.message}
          registration={f.register("holdMinutes")}
        />
        <NumberSetting
          id="serviceFee"
          label="Service fee"
          unit="৳ per booking"
          max={10000}
          step="0.01"
          hint="Added to portal bookings only. Staff bookings have no fee. Set 0 for none."
          error={errors.serviceFee?.message}
          registration={f.register("serviceFee")}
        />
        <Controller
          control={f.control}
          name="portalCashEnabled"
          render={({ field }) => (
            <SettingToggle
              label="Let customers pay at the venue"
              desc="Offers cash at the venue on checkout. Those bookings wait for staff to confirm."
              checked={!!field.value}
              onChange={field.onChange}
            />
          )}
        />
      </CardContent>
    </Card>
  );
}
