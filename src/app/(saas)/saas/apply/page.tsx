import type { Metadata } from "next";
import { OwnerApplicationForm } from "@/components/features/saas/owner-application-form";

export const metadata: Metadata = {
  title: { absolute: "Apply for Turf SaaS owner access" },
  robots: { index: false, follow: false },
};

export default async function OwnerApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[]; interval?: string | string[] }>;
}) {
  const { plan, interval } = await searchParams;
  return (
    <OwnerApplicationForm
      initialPlanId={typeof plan === "string" ? plan : ""}
      initialInterval={interval === "yearly" ? "yearly" : "monthly"}
    />
  );
}
