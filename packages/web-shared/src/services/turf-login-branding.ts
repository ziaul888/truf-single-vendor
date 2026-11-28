import "server-only";

import { cache } from "react";
import { unstable_rethrow } from "next/navigation";
import { PRODUCT_NAME } from "../lib/product-name";
import { isTurfPortalSlug } from "../lib/turf-portal-path";
import type { PublicVenue } from "../types/settings";
import { getDefaultTurf } from "./turf-portal-request";
import { getPublicTurfWebsite } from "./website-settings";

type VenueBrand = Pick<PublicVenue, "name" | "logoUrl">;
export const PRODUCT_BRAND: VenueBrand = { name: PRODUCT_NAME, logoUrl: null };

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
