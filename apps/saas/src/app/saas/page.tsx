import { SaasLanding } from "@/components/features/saas/saas-landing";
import { ownerAppUrl } from "@/lib/owner-app";
import { getSaasScreenshots } from "@/services/saas-screenshots";

export default async function SaasPage({
  searchParams,
}: {
  searchParams: Promise<{ interval?: string | string[] }>;
}) {
  const [screenshots, { interval }] = await Promise.all([
    getSaasScreenshots(),
    searchParams,
  ]);
  return (
    <SaasLanding
      homeHref="/saas"
      ownerHref={ownerAppUrl("/admin")}
      screenshots={screenshots}
      initialInterval={interval === "yearly" ? "yearly" : "monthly"}
    />
  );
}
