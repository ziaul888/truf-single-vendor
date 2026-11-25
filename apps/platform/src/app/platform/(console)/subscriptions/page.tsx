import type { Metadata } from "next";
import { PlatformBillingDirectory } from "@/components/features/platform/platform-billing-directory";
export const metadata: Metadata = { title: "Subscriptions" };
export default function Page() {
  return <PlatformBillingDirectory kind="subscriptions" />;
}
