import { fromMinorUnits } from "@/lib/ground-format";
import type { Ground } from "@/types/api";
import type { ApiPublicGround, GroundFormat, Sport, Surface } from "@/types/ground";
import type { PublicSlot } from "@/types/slot";
import { turfPortalApiPrefix, turfPortalPath } from "@/lib/turf-portal-path";

// Server-side reads of turf-api's public grounds for the customer portal.
// Server code can't use the relative /api/v1 proxy path, so it calls turf-api directly.

const API_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:4000";
const REVALIDATE_SECONDS = 60;

function toPortalGround(g: ApiPublicGround): Ground {
  return {
    id: g.id,
    name: g.name,
    description: g.description,
    rules: g.rules,
    address: g.address,
    hourlyRate: fromMinorUnits(g.hourlyPrice),
    openHour: g.openingHour,
    closeHour: g.closingHour,
    sport: g.sport,
    format: g.format ?? undefined,
    surface: g.surface ?? undefined,
    dimensions: g.dimensions ?? undefined,
    capacity: g.capacity ?? undefined,
    amenities: g.amenities,
    availableDays: g.availableDays,
    customDays: g.customDays,
    peakRate: g.peakPrice === null ? undefined : fromMinorUnits(g.peakPrice),
    peakRanges: g.peakRanges,
    slotDurationMinutes: g.slotDurationMinutes,
    images: g.photos,
  };
}

export interface GroundFilters {
  sport?: Sport;
  format?: GroundFormat;
  surface?: Surface;
}

/**
 * Grounds visible on the portal, sorted by name, optionally filtered.
 * Returns [] if turf-api can't be reached, so pages still render.
 */
export async function listPublicGrounds(filters: GroundFilters = {}, slug?: string): Promise<Ground[]> {
  const query = new URLSearchParams({ limit: "100" });
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
  try {
    const res = await fetch(`${API_TARGET}/api/v1${turfPortalApiPrefix(slug)}/grounds?${query}`,
      slug ? { cache: "no-store" } : { next: { revalidate: REVALIDATE_SECONDS } });
    if (slug && res.status === 404) notFound();
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return (json.data.data as ApiPublicGround[]).map(toPortalGround);
  } catch (err) {
    if (slug) throw err;
    console.error("Failed to load grounds from turf-api", err);
    return [];
  }
}

/**
 * Where "Book now" goes: straight to the ground's slots when the venue has just one, else the list.
 * Linking there directly avoids /grounds' loading screen flashing before its redirect.
 */
export async function bookingHref(slug?: string): Promise<string> {
  const grounds = await listPublicGrounds({}, slug);
  return turfPortalPath(slug, grounds.length === 1 ? `/grounds/${grounds[0].id}` : "/grounds");
}

/** One active ground, or null when it doesn't exist or is inactive (404). Throws on other failures. */
export async function getPublicGround(id: string, slug?: string): Promise<Ground | null> {
  const res = await fetch(`${API_TARGET}/api/v1${turfPortalApiPrefix(slug)}/grounds/${encodeURIComponent(id)}`,
    slug ? { cache: "no-store" } : { next: { revalidate: REVALIDATE_SECONDS } });
  // 400 = not a valid id, 404 = missing or inactive.
  if (res.status === 404 || res.status === 400) return null;
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? "Failed to load ground");
  return toPortalGround(json.data);
}

/** A ground's slots on one date, with live availability. [] if turf-api can't be reached. */
export async function getPublicSlots(groundId: string, date: string, slug?: string): Promise<PublicSlot[]> {
  try {
    const query = new URLSearchParams({ date });
    const res = await fetch(`${API_TARGET}/api/v1${turfPortalApiPrefix(slug)}/grounds/${encodeURIComponent(groundId)}/slots?${query}`, {
      cache: "no-store",
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error("Failed to load slots from turf-api", err);
    return [];
  }
}
import { notFound } from "next/navigation";
