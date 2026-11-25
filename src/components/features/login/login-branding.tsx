"use client";

import { PlatformBrandMark } from "@/components/features/platform/platform-brand-mark";
import { usePublicVenue } from "@/hooks/useSettings";

export function LoginBrand() {
  const { data: venue } = usePublicVenue();

  return (
    <div className="flex min-h-11 items-center gap-3">
      <PlatformBrandMark logoUrl={venue?.logoUrl ?? null} />
      <p className="min-w-0 text-lg font-bold tracking-tight [overflow-wrap:anywhere]">
        {venue?.name || "TurfOrg"}
      </p>
    </div>
  );
}
