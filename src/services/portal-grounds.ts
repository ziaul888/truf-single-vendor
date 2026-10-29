import { fromMinorUnits } from "@/lib/ground-format";
import type { Ground } from "@/types/api";
import type { ApiPublicGround, GroundFormat, Sport, Surface } from "@/types/ground";
import type { PublicSlot } from "@/types/slot";

// Server-side reads of turf-api's public grounds for the customer portal.
// Server code can't use the relative /api/v1 proxy path, so it calls turf-api directly.

const API_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:4000";
const REVALIDATE_SECONDS = 60;

function toPortalGround(g: ApiPublicGround): Ground {
  return {
    id: g.id,
    name: g.name,
    description: g.description,
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
export async function listPublicGrounds(filters: GroundFilters = {}): Promise<Ground[]> {
  const query = new URLSearchParams({ limit: "100" });
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
  try {
    const res = await fetch(`${API_TARGET}/api/v1/grounds?${query}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return (json.data.data as ApiPublicGround[]).map(toPortalGround);
  } catch (err) {
    console.error("Failed to load grounds from turf-api", err);
    return [];
  }
}

/** One active ground, or null when it doesn't exist or is inactive (404). Throws on other failures. */
export async function getPublicGround(id: string): Promise<Ground | null> {
  const res = await fetch(`${API_TARGET}/api/v1/grounds/${encodeURIComponent(id)}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  // 400 = not a valid id, 404 = missing or inactive.
  if (res.status === 404 || res.status === 400) return null;
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? "Failed to load ground");
  return toPortalGround(json.data);
}

/** A ground's slots on one date, with live availability. [] if turf-api can't be reached. */
export async function getPublicSlots(groundId: string, date: string): Promise<PublicSlot[]> {
  try {
    const res = await fetch(`${API_TARGET}/api/v1/grounds/${encodeURIComponent(groundId)}/slots?date=${date}`, {
      cache: "no-store",
    });
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    console.error("Failed to load slots from turf-api", err);
    return [];
  }
}
