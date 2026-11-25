import "server-only";

import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import {
  CUSTOMER_PORTAL_HOME, CUSTOMER_PORTAL_HOME_HEADER, isLocalHost, isTurfPortalSlug,
  TURF_PORTAL_HEADER, turfPortalPath,
} from "@/lib/turf-portal-path";

export async function getDefaultTurf(): Promise<string | undefined> {
  try {
    const api = process.env.API_PROXY_TARGET ?? "http://localhost:4000";
    const response = await fetch(new URL("/api/v1/turfs/default", api), {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return;
    const { data, success } = await response.json();
    const slug = data?.slug;
    if (success && typeof slug === "string" && isTurfPortalSlug(slug)) return slug;
  } catch (error) {
    unstable_rethrow(error);
  }
}

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
