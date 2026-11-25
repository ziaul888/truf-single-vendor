import type { Metadata } from "next";
import { PlatformPlansView } from "@/components/features/platform/platform-plans";
export const metadata: Metadata = { title: "Subscription plans" };
export default function Page() {
  return <PlatformPlansView />;
}
