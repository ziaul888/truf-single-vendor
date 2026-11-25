import type { Metadata } from "next";
import { PlatformOnboardingForm } from "@/components/features/platform/platform-onboarding-form";
export const metadata: Metadata = { title: "Add turf business" };
export default function Page() {
  return <PlatformOnboardingForm />;
}
