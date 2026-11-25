import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { DEFAULT_PLATFORM_BRANDING, type PlatformBranding } from "@/lib/platform-branding";
import { isTurfPortalSlug } from "@/lib/turf-portal-path";
import type { PublicVenue } from "@/types/settings";
import { getDefaultTurf } from "./turf-portal-request";
import { getPublicTurfWebsite, getPublicVenue } from "./website-settings";

const API_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:4000";
type VenueBrand = Pick<PublicVenue, "name" | "logoUrl">;
export const TURFORG_BRAND: VenueBrand = { name: "TurfOrg", logoUrl: null };

async function getBranding<T>(path: string, cookie?: string): Promise<T | undefined> {
  try {
    const response = await fetch(new URL(path, API_TARGET), {
      cache: "no-store",
      headers: cookie ? { Cookie: cookie } : undefined,
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return;
    const result = await response.json();
    if (result.success) return result.data;
  } catch (error) {
    unstable_rethrow(error);
  }
}

export const getPlatformBranding = cache(async () =>
  (await getBranding<PlatformBranding>("/api/v1/platform/branding")) ?? DEFAULT_PLATFORM_BRANDING
);

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
