import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { getBranding } from "@/services/platform-branding";
import type { PublicVenue } from "@/types/settings";
import { getPublicVenue } from "@/services/website-settings";
import { TURFORG_BRAND } from "@/services/turf-login-branding";

type VenueBrand = Pick<PublicVenue, "name" | "logoUrl">;

export const getDashboardBranding = cache(async () => {
  const token = (await cookies()).get("owner_token")?.value;
  if (!token) return { venue: await getPublicVenue(), isOwner: false };
  const venue = await getBranding<VenueBrand>("/api/v1/owner/admin/settings/venue", `owner_token=${encodeURIComponent(token)}`);
  return { venue: venue ?? TURFORG_BRAND, isOwner: true };
});
