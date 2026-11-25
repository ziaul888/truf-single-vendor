"use client";

import { PlatformBrandMark } from "@/components/features/platform/platform-brand-mark";
import { usePlatformBranding } from "@/hooks/usePlatformBranding";

export function LoginBrand() {
  const { data: branding } = usePlatformBranding();

  return (
    <div className="flex min-h-11 items-center gap-3">
      <PlatformBrandMark logoUrl={branding?.logoUrl ?? null} />
      <p className="min-w-0 text-lg font-bold tracking-tight [overflow-wrap:anywhere]">
        {branding?.title || "TurfOrg"}
      </p>
    </div>
  );
}
