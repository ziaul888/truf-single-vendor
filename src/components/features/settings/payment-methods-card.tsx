"use client";

import { Banknote, Building, CreditCard, Smartphone, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { SettingToggle } from "@/components/features/slots/setting-fields";
import { useUpdateSlotSettings } from "@/hooks/useSlots";
import { toApiFailure } from "@/lib/api-error";
import type { PaymentStatus } from "@/types/settings";
import type { SlotSettings } from "@/types/slot";
import { SettingsSection } from "./settings-section";

/** The admin's switches for what the booking website offers. */
export type PortalSwitches = Pick<SlotSettings, "portalCashEnabled" | "portalCardEnabled" | "portalBkashEnabled" | "portalNagadEnabled">;
type SwitchKey = keyof PortalSwitches;

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

const SWITCHES: { key: SwitchKey; label: string; desc: string; name: string }[] = [
  { key: "portalCashEnabled", name: "Pay at venue", label: "Let customers pay at the venue",
    desc: "Offers cash at the venue on the booking website. Those bookings wait for staff to confirm." },
  { key: "portalCardEnabled", name: "Card", label: "Let customers pay by card",
    desc: "Needs the Stripe keys too. A checkout already started can still finish." },
  { key: "portalBkashEnabled", name: "bKash", label: "Let customers pay by bKash",
    desc: "Needs the bKash number below too. Off keeps the number." },
  { key: "portalNagadEnabled", name: "Nagad", label: "Let customers pay by Nagad",
    desc: "Needs the Nagad number below too. Off keeps the number." },
];

/** Why a method customers could use isn't offered: switched off here, or what it needs is missing. */
const offWhy = (switchedOn: boolean, missing: string) => (switchedOn ? missing : "Switched off below.");

/** Which ways to pay are on, plus the admin-only switches for the booking website. */
export function PaymentMethodsCard({ status, switches, canEdit, onSaved }: {
  status: PaymentStatus; switches: PortalSwitches; canEdit: boolean; onSaved: () => void;
}) {
  const save = useUpdateSlotSettings();

  async function toggle(key: SwitchKey, name: string, on: boolean) {
    try {
      await save.mutateAsync({ [key]: on });
      onSaved();
      toast.success(`${name} turned ${on ? "on" : "off"} for customers`);
    } catch (err) {
      toast.error(toApiFailure(err).error);
    }
  }

  const { methods } = status;
  const wallet = "Customers send money and enter the TrxID; staff verify it.";
  return (
    <SettingsSection title="Payment methods" icon={Wallet} description="Card online; bKash and Nagad sent by hand and verified by staff">
      <MethodRow icon={CreditCard} label="Card (Stripe)" on={methods.card}
        desc={methods.card ? "Customers pay online at checkout." : offWhy(switches.portalCardEnabled, "Needs Stripe keys in turf-api.")} />
      <MethodRow icon={Banknote} label="Cash" on={methods.cash} desc="Staff record cash payments on a booking." />
      <MethodRow icon={Building} label="Bank transfer" on={methods.bankTransfer} desc="Staff record bank transfers on a booking." />
      <MethodRow icon={Smartphone} label="bKash" on={methods.bkash}
        desc={methods.bkash ? wallet : offWhy(switches.portalBkashEnabled, "Set the bKash number below to offer it to customers.")} />
      <MethodRow icon={Smartphone} label="Nagad" on={methods.nagad}
        desc={methods.nagad ? wallet : offWhy(switches.portalNagadEnabled, "Set the Nagad number below to offer it to customers.")} />
      <div className="space-y-4 border-t pt-4">
        <p className="text-xs text-muted-foreground">On the booking website. Each switch saves straight away.</p>
        {SWITCHES.map(({ key, label, desc, name }) => (
          <SettingToggle key={key} label={label} desc={desc} checked={switches[key]}
            onChange={(on) => toggle(key, name, on)} disabled={!canEdit || save.isPending} />
        ))}
      </div>
    </SettingsSection>
  );
}
