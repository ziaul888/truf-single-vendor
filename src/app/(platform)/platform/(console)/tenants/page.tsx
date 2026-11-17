import type { Metadata } from "next";
import { PlatformTenantDirectory } from "@/components/features/platform/platform-tenant-directory";
import { PLATFORM_TENANT_STATUSES } from "@/types/platform";
export const metadata: Metadata = { title: "Turf businesses" };
export default async function PlatformTenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = PLATFORM_TENANT_STATUSES.find((value) => value === params.status);
  return <PlatformTenantDirectory key={status ?? "all"} initialStatus={status} />;
}
