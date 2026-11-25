import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { getBranding } from "@/services/platform-branding";
import { isTurfPortalSlug } from "@/lib/turf-portal-path";
import type { PublicVenue } from "@/types/settings";
import { getDefaultTurf } from "./turf-portal-request";
import { getPublicTurfWebsite, getPublicVenue } from "./website-settings";

type VenueBrand = Pick<PublicVenue, "name" | "logoUrl">;
export const TURFORG_BRAND: VenueBrand = { name: "TurfOrg", logoUrl: null };

export const getDashboardBranding = cache(async () => {
  const token = (await cookies()).get("owner_token")?.value;
  if (!token) return { venue: await getPublicVenue(), isOwner: false };
  const venue = await getBranding<VenueBrand>("/api/v1/owner/admin/settings/venue", `owner_token=${encodeURIComponent(token)}`);
  return { venue: venue ?? TURFORG_BRAND, isOwner: true };
});

export const getTurfLoginBranding = cache(async (turf?: string | string[]) => {
  const slug = turf === undefined
    ? await getDefaultTurf()
    : typeof turf === "string" && isTurfPortalSlug(turf) ? turf : undefined;
  if (!slug) return;
  try {
    const website = await getPublicTurfWebsite(slug, AbortSignal.timeout(1500));
    if (website) return { venue: website.venue, slug };
  } catch (error) {
    unstable_rethrow(error);
  }
});
