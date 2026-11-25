import type { Metadata } from "next";
import { PlatformLandingScreenshots } from "@/components/features/platform/platform-landing-screenshots";

export const metadata: Metadata = { title: "Landing page settings" };

export default function PlatformLandingSettingsPage() {
  return <PlatformLandingScreenshots />;
}
