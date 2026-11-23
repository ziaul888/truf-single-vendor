import { SaasLanding } from "@/components/features/saas/saas-landing";
import { getTurfPortalHome } from "@/services/turf-portal-request";
import { getSaasScreenshots } from "@/services/saas-screenshots";

export default async function SaasPage() {
  const [customerHome, screenshots] = await Promise.all([
    getTurfPortalHome(),
    getSaasScreenshots(),
  ]);
  return <SaasLanding homeHref={customerHome === "/" ? "/saas" : "/"} screenshots={screenshots} />;
}
