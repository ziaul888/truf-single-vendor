import type { Metadata } from "next";
import { PlatformPlanForm } from "@/components/features/platform/platform-plan-form";
export const metadata: Metadata = { title: "Create plan" };
export default function Page() {
  return <PlatformPlanForm />;
}
