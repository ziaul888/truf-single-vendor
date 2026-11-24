import { SaasLanding } from "@/components/features/saas/saas-landing";
import { getTurfPortalHome } from "@/services/turf-portal-request";
import { getSaasScreenshots } from "@/services/saas-screenshots";

export default async function SaasPage({
  searchParams,
}: {
  searchParams: Promise<{ interval?: string | string[] }>;
}) {
  const [customerHome, screenshots, { interval }] = await Promise.all([
    getTurfPortalHome(),
    getSaasScreenshots(),
    searchParams,
  ]);
  return (
    <SaasLanding
      homeHref={customerHome === "/" ? "/saas" : "/"}
      screenshots={screenshots}
      initialInterval={interval === "yearly" ? "yearly" : "monthly"}
    />
  );
}
