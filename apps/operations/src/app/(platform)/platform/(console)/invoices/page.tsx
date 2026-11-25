import type { Metadata } from "next";
import { z } from "zod";
import { PlatformBillingDirectory } from "@/components/features/platform/platform-billing-directory";
export const metadata: Metadata = { title: "Invoices" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const { tenantId } = await searchParams;
  return (
    <PlatformBillingDirectory
      kind="invoices"
      initialTenantId={z.uuid().safeParse(tenantId).success ? tenantId : undefined}
    />
  );
}
