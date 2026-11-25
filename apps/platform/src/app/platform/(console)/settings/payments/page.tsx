"use client";

import { PlatformPaymentInstructions } from "@/components/features/platform/platform-payment-instructions";
import { usePlatformMe } from "@/hooks/usePlatform";

export default function PlatformPaymentSettingsPage() {
  const { data: user } = usePlatformMe();

  return <PlatformPaymentInstructions userId={user?.id} />;
}
