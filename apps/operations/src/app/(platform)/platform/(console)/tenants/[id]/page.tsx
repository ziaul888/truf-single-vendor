import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PlatformTenantDetail } from "@/components/features/platform/platform-tenant-detail";
export const metadata: Metadata = { title: "Turf account" };
export default async function PlatformTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  return <PlatformTenantDetail id={id} />;
}
