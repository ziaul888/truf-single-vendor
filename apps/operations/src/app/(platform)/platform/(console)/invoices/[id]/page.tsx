import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PlatformInvoiceDetail } from "@/components/features/platform/platform-invoice-detail";
export const metadata: Metadata = { title: "Subscription invoice" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  return <PlatformInvoiceDetail id={id} />;
}
