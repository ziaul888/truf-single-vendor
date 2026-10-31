"use client";

import { usePaymentStatus } from "@/hooks/useSettings";
import { useSlotSettings } from "@/hooks/useSlots";
import { useMe } from "@/hooks/useMe";
import { SettingsPageHeader } from "@/components/features/settings/settings-page-header";
import { ReadOnlyNotice } from "@/components/features/settings/read-only-notice";
import { SettingsLoadError, SettingsLoading } from "@/components/features/settings/settings-load-state";
import { StripeStatusCard } from "@/components/features/settings/stripe-status-card";
import { PaymentMethodsCard } from "@/components/features/settings/payment-methods-card";

// Read-only payment status. Stripe keys live in turf-api's .env; only "pay at venue" is editable here.
export default function PaymentsSettingsPage() {
  const { data: status, isLoading, isError, refetch } = usePaymentStatus();
  // "Pay at venue" is a slot setting; its cache updates as soon as the switch saves.
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
          portalCash={slotSettings?.portalCashEnabled ?? status.portalCashEnabled}
          canEdit={canEdit}
          onSaved={() => refetch()}
        />
      </div>
    </div>
  );
}
