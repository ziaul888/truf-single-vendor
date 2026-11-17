import type { Metadata } from "next";
import { OwnerActivation } from "@/components/features/owner/owner-activation";
export const metadata: Metadata = { title: "Activate account" };
export default function Page() {
  return <OwnerActivation />;
}
