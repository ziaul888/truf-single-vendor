import type { Metadata } from "next";
import { OwnerApplicationForm } from "@/components/features/saas/owner-application-form";

export const metadata: Metadata = {
  title: { absolute: "Apply for turf owner access · TurfOrg" },
  robots: { index: false, follow: false },
};

export default async function OwnerApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[]; interval?: string | string[] }>;
}) {
  const { plan, interval } = await searchParams;
  const planId = typeof plan === "string" ? plan : "";
  const billingInterval = interval === "yearly" ? "yearly" : "monthly";

  return (
    <main className="saas-page pitch min-h-dvh">
      <OwnerApplicationForm
        key={`${planId}:${billingInterval}`}
        initialPlanId={planId}
        initialInterval={billingInterval}
      />
    </main>
  );
}
