import { SaasLanding } from "@/components/features/saas/saas-landing";
import { getTurfPortalHome } from "@/services/turf-portal-request";

export default async function SaasPage() {
  const customerHome = await getTurfPortalHome();
  return <SaasLanding homeHref={customerHome === "/" ? "/saas" : "/"} />;
}
