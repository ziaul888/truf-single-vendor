"use client";

import { usePaymentStatus } from "@/hooks/useSettings";
import { useSlotSettings } from "@/hooks/useSlots";
import { useMe } from "@/hooks/useMe";
import { SettingsPageHeader } from "@/components/features/settings/settings-page-header";
import { ReadOnlyNotice } from "@/components/features/settings/read-only-notice";
import { SettingsLoadError, SettingsLoading } from "@/components/features/settings/settings-load-state";
import { StripeStatusCard } from "@/components/features/settings/stripe-status-card";
import { PaymentMethodsCard } from "@/components/features/settings/payment-methods-card";
import { WalletNumbersForm } from "@/components/features/settings/wallet-numbers-form";

// Read-only payment status. Stripe keys live in turf-api's .env; the switches for what the booking
// website offers (pay at venue, card, bKash, Nagad) and the bKash / Nagad numbers are editable here (admin only).
export default function PaymentsSettingsPage() {
  const { data: status, isLoading, isError, refetch } = usePaymentStatus();
  // The switches are slot settings; their cache updates as soon as one saves.
  const { data: slotSettings } = useSlotSettings();
  const { data: me } = useMe();
  const canEdit = me?.role === "admin";

  if (isLoading) return <SettingsLoading />;
  if (isError || !status) return <SettingsLoadError what="payment status" onRetry={() => refetch()} />;

  return (
    <div className="space-y-5">
      <SettingsPageHeader title="Payments" description="Stripe status and the ways customers can pay" />
      {!canEdit && <ReadOnlyNotice />}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <StripeStatusCard stripe={status.stripe} />
        <PaymentMethodsCard
          status={status}
          switches={{
            portalCashEnabled: slotSettings?.portalCashEnabled ?? status.portalCashEnabled,
            portalCardEnabled: slotSettings?.portalCardEnabled ?? true,
            portalBkashEnabled: slotSettings?.portalBkashEnabled ?? true,
            portalNagadEnabled: slotSettings?.portalNagadEnabled ?? true,
          }}
          canEdit={canEdit}
          onSaved={() => refetch()}
        />
      </div>
      {slotSettings && <WalletNumbersForm settings={slotSettings} canEdit={canEdit} onSaved={() => refetch()} />}
    </div>
  );
}
