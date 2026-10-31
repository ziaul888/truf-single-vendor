import { unstable_rethrow } from "next/navigation";
import type { WebsiteSettings } from "@/validations/website-settings";
import type { PublicVenue } from "@/types/settings";
import { DEFAULT_WEBSITE_SETTINGS, FALLBACK_VENUE } from "@/lib/website-defaults";

// Server-side read of the portal's website content and venue profile from turf-api.
// Server code can't use the relative /api/v1 proxy path, so it calls turf-api directly.

const API_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:4000";

export interface PublicWebsite extends WebsiteSettings {
  venue: PublicVenue;
}

/**
 * GET /website: the content plus the public venue profile, in one request. turf-api
 * caches it for 60 s and clears that on save, so this always asks it (no Next cache).
 */
export async function getPublicWebsite(): Promise<PublicWebsite> {
  try {
    const res = await fetch(`${API_TARGET}/api/v1/website`, { cache: "no-store" });
    const json = await res.json();
    if (json.success) return json.data;
    console.error("GET /website failed:", json.error);
  } catch (err) {
    // Let Next's own signals through (e.g. "this page is dynamic"); only fall back on a real failure.
    unstable_rethrow(err);
    console.error("GET /website failed:", err);
  }
  return { ...DEFAULT_WEBSITE_SETTINGS, venue: FALLBACK_VENUE };
}

/** GET /venue: just the public venue profile, for pages that don't need the website content. */
export async function getPublicVenue(): Promise<PublicVenue> {
  try {
    const res = await fetch(`${API_TARGET}/api/v1/venue`, { cache: "no-store" });
    const json = await res.json();
    if (json.success) return json.data;
    console.error("GET /venue failed:", json.error);
  } catch (err) {
    unstable_rethrow(err);
    console.error("GET /venue failed:", err);
  }
  return FALLBACK_VENUE;
}
