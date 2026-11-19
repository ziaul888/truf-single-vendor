import "server-only";

import { headers } from "next/headers";
import { isTurfPortalSlug, TURF_PORTAL_HEADER } from "@/lib/turf-portal-path";

export async function getTurfPortalSlug(): Promise<string | undefined> {
  const slug = (await headers()).get(TURF_PORTAL_HEADER);
  return slug && isTurfPortalSlug(slug) ? slug : undefined;
}
