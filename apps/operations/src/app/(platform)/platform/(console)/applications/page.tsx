import type { Metadata } from "next";
import { PlatformApplications } from "@/components/features/platform/platform-applications";

export const metadata: Metadata = { title: "Owner applications" };

export default function PlatformApplicationsPage() {
  return <PlatformApplications />;
}
