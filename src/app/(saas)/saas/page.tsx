import { SaasLanding } from "@/components/features/saas/saas-landing";
import { getTurfPortalHome } from "@/services/turf-portal-request";
import { getSaasScreenshots } from "@/services/saas-screenshots";

export default async function SaasPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[]; interval?: string | string[] }>;
}) {
  const [customerHome, screenshots, { plan, interval }] = await Promise.all([
    getTurfPortalHome(),
    getSaasScreenshots(),
    searchParams,
  ]);
  return (
    <SaasLanding
      homeHref={customerHome === "/" ? "/saas" : "/"}
      screenshots={screenshots}
      initialPlanId={typeof plan === "string" ? plan : ""}
      initialInterval={interval === "yearly" ? "yearly" : "monthly"}
    />
  );
}
