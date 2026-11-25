import { unstable_rethrow } from "next/navigation";
import { PlatformBrandMark } from "@/components/features/platform/platform-brand-mark";
import { isTurfPortalSlug } from "@/lib/turf-portal-path";
import { getDefaultTurf } from "@/services/turf-portal-request";
import { getPublicTurfWebsite } from "@/services/website-settings";
import type { PublicVenue } from "@/types/settings";

export async function TurfLoginBrand({ turf }: { turf?: string | string[] }) {
  const slug = turf === undefined
    ? await getDefaultTurf()
    : typeof turf === "string" && isTurfPortalSlug(turf) ? turf : undefined;
  if (!slug) return <LoginBrand />;

  let venue: PublicVenue | undefined;
  try {
    const website = await getPublicTurfWebsite(slug, AbortSignal.timeout(1500));
    venue = website?.venue;
  } catch (error) {
    unstable_rethrow(error);
  }
  return <LoginBrand venue={venue} />;
}

export function LoginBrand({ venue }: { venue?: Pick<PublicVenue, "name" | "logoUrl"> }) {
  return (
    <div className="flex min-h-11 items-center gap-3">
      <PlatformBrandMark logoUrl={venue?.logoUrl ?? null} />
      <p className="min-w-0 text-lg font-bold tracking-tight [overflow-wrap:anywhere]">
        {venue?.name || "TurfOrg"}
      </p>
    </div>
  );
}
