import { Suspense } from "react";
import type { Metadata } from "next";
import { PlatformLogin } from "@/components/features/platform/platform-login";
export const metadata: Metadata = { title: "Platform sign in" };
export default function PlatformLoginPage() {
  return (
    <Suspense>
      <PlatformLogin />
    </Suspense>
  );
}
