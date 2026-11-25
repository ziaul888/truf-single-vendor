import type { Metadata } from "next";
import { PlatformOverviewView } from "@/components/features/platform/platform-overview";
export const metadata: Metadata = { title: "Overview" };
export default function PlatformOverviewPage() {
  return <PlatformOverviewView />;
}
