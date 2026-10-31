"use client";

import { Banknote, Building, CreditCard, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { SettingToggle } from "@/components/features/slots/setting-fields";
import { useUpdateSlotSettings } from "@/hooks/useSlots";
import { toApiFailure } from "@/lib/api-error";
import type { PaymentStatus } from "@/types/settings";
import { SettingsSection } from "./settings-section";

function MethodRow({ icon: Icon, label, desc, on }: { icon: React.ElementType; label: string; desc: string; on: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Badge variant={on ? "secondary" : "outline"} className={on ? "" : "text-muted-foreground"}>{on ? "Available" : "Off"}</Badge>
    </div>
  );
}

/** Which ways to pay are on, plus the admin-only "pay at venue" switch for the booking website. */
export function PaymentMethodsCard({ status, portalCash, canEdit, onSaved }: {
  status: PaymentStatus; portalCash: boolean; canEdit: boolean; onSaved: () => void;
}) {
  const save = useUpdateSlotSettings();

  async function toggleCash(on: boolean) {
    try {
      await save.mutateAsync({ portalCashEnabled: on });
      onSaved();
      toast.success(on ? "Customers can now pay at the venue" : "Pay at venue turned off");
    } catch (err) {
      toast.error(toApiFailure(err).error);
    }
  }

  const { methods } = status;
  return (
    <SettingsSection title="Payment methods" icon={Wallet} description="Card is the only online method in v1">
      <MethodRow icon={CreditCard} label="Card (Stripe)" on={methods.card}
        desc={methods.card ? "Customers pay online at checkout." : "Needs Stripe keys in turf-api."} />
      <MethodRow icon={Banknote} label="Cash" on={methods.cash} desc="Staff record cash payments on a booking." />
      <MethodRow icon={Building} label="Bank transfer" on={methods.bankTransfer} desc="Staff record bank transfers on a booking." />
      <div className="border-t pt-4">
        <SettingToggle
          label="Let customers pay at the venue"
          desc="Offers cash at the venue on the booking website. Those bookings wait for staff to confirm. Saves straight away."
          checked={portalCash}
          onChange={toggleCash}
          disabled={!canEdit || save.isPending}
        />
      </div>
    </SettingsSection>
  );
}
