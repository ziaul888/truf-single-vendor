import type { Metadata } from "next";
import { OwnerLogin } from "@/components/features/owner/owner-login";
export const metadata: Metadata = { title: "Sign in" };
export default function Page() {
  return <OwnerLogin />;
}
