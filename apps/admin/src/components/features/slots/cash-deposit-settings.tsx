"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SlotSettingsForm } from "@/validations/slot-settings";
import { NumberSetting, SettingToggle } from "./setting-fields";

/** Lets admins ask cash customers for booking money by bKash / Nagad, and sets its share of the total. */
export function CashDepositSettings({ form: f }: { form: UseFormReturn<SlotSettingsForm> }) {
  const enabled = f.watch("cashDepositEnabled");
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-muted-foreground" /> Booking money for cash bookings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Controller
          control={f.control}
          name="cashDepositEnabled"
          render={({ field }) => (
            <SettingToggle
              label="Ask for booking money"
              desc="Customers who pay at the venue first send a share of the total by bKash / Nagad, and pay the rest in cash. You verify the payment as for any bKash / Nagad booking. Off by default."
              checked={!!field.value}
              onChange={field.onChange}
            />
          )}
        />
        {enabled && (
          <>
            <NumberSetting
              id="cashDepositPercent"
              label="Booking money"
              unit="% of the total"
              min={1}
              max={100}
              hint="Customers pay this share by bKash / Nagad and the rest in cash at the venue (1–100)."
              error={f.formState.errors.cashDepositPercent?.message}
              registration={f.register("cashDepositPercent")}
            />
            <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              This needs a bKash or Nagad number set under Settings → Payments. Without one, paying at the venue is not offered at checkout.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
