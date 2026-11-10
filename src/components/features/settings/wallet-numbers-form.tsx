"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateSlotSettings } from "@/hooks/useSlots";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import type { SlotSettings } from "@/types/slot";
import { SettingsSaveActions } from "./settings-save-actions";
import { SettingsSection } from "./settings-section";

// Empty switches that wallet off on the booking website; turf-api checks and normalises the number.
const walletNumber = z.string().trim().refine((v) => v === "" || v.replace(/\D/g, "").length >= 10, "Enter a phone number with at least 10 digits");
const WalletNumbersSchema = z.object({ bkashNumber: walletNumber, nagadNumber: walletNumber });
type WalletNumbers = z.infer<typeof WalletNumbersSchema>;

const FIELDS = [
  { name: "bkashNumber", label: "bKash number" },
  { name: "nagadNumber", label: "Nagad number" },
] as const;

/**
 * The venue's bKash and Nagad numbers. Customers send the total there and enter the TrxID; staff
 * verify it in their own app on Confirm Bookings. Admin only, like every setting.
 */
export function WalletNumbersForm({ settings, canEdit, onSaved }: { settings: SlotSettings; canEdit: boolean; onSaved: () => void }) {
  const save = useUpdateSlotSettings();
  const { bkashNumber, nagadNumber } = settings;
  // Saved values; the form follows them when they change (after a save, or a refetch).
  const values = useMemo(() => ({ bkashNumber: bkashNumber ?? "", nagadNumber: nagadNumber ?? "" }), [bkashNumber, nagadNumber]);
  const form = useForm<WalletNumbers>({ resolver: zodResolver(WalletNumbersSchema), values });
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = form;

  const onSubmit = handleSubmit(async (v) => {
    try {
      await save.mutateAsync({ bkashNumber: v.bkashNumber || null, nagadNumber: v.nagadNumber || null });
      onSaved();
      toast.success("bKash and Nagad numbers saved");
    } catch (err) {
      const failure = toApiFailure(err);
      if (!applyApiErrors(form, failure)) toast.error(failure.error);
    }
  });

  return (
    <SettingsSection title="bKash and Nagad" icon={Smartphone} description="Leave a number empty to turn that option off on the booking website">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map(({ name, label }) => (
            <div key={name} className="space-y-1.5">
              <Label htmlFor={name}>{label}</Label>
              <Input id={name} type="tel" placeholder="01XXXXXXXXX" disabled={!canEdit} aria-invalid={!!errors[name]} {...register(name)} />
              {errors[name] && <p className="text-xs text-destructive">{errors[name]?.message}</p>}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Customers send the total to this number and enter the TrxID. Each booking waits on Confirm Bookings until you find the payment in your app and verify it.
        </p>
        {canEdit && (
          <div className="flex gap-2 sm:justify-end [&>button]:flex-1 sm:[&>button]:flex-none">
            <SettingsSaveActions dirty={isDirty} saving={save.isPending} onDiscard={() => reset(values)} />
          </div>
        )}
      </form>
    </SettingsSection>
  );
}
