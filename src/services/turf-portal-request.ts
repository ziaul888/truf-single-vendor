import "server-only";

import { headers } from "next/headers";
import {
  CUSTOMER_PORTAL_HOME, CUSTOMER_PORTAL_HOME_HEADER, isLocalHost, isTurfPortalSlug,
  TURF_PORTAL_HEADER, turfPortalPath,
} from "@/lib/turf-portal-path";

export async function getTurfPortalSlug(): Promise<string | undefined> {
  const slug = (await headers()).get(TURF_PORTAL_HEADER);
  return slug && isTurfPortalSlug(slug) ? slug : undefined;
}

export async function getTurfPortalHome(slug?: string) {
  if (slug) return turfPortalPath(slug);
  const requestHeaders = await headers();
  const marked = requestHeaders.get(CUSTOMER_PORTAL_HOME_HEADER) === CUSTOMER_PORTAL_HOME;
  const local = isLocalHost(requestHeaders.get("host") ?? "");
  return local && !marked ? "/" : CUSTOMER_PORTAL_HOME;
}
