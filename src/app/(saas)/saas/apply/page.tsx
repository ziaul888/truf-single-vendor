import type { Metadata } from "next";
import { OwnerApplicationForm } from "@/components/features/saas/owner-application-form";

export const metadata: Metadata = {
  title: { absolute: "Apply for turf-owner access" },
  robots: { index: false, follow: false },
};

export default function OwnerApplicationPage() {
  return <OwnerApplicationForm />;
}
