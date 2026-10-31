import { FORMATS, SPORTS, SURFACES, type GroundFormat, type Sport, type Surface } from "@/types/ground";
import type { Ground } from "@/types/api";

export const SORTS = ["recommended", "price-asc", "price-desc", "format"] as const;
export type GroundSort = (typeof SORTS)[number];

/** The /grounds page's URL state: turf-api filters plus a sort the page applies itself. */
export interface GroundsQuery {
  sport?: Sport;
  format?: GroundFormat;
  surface?: Surface;
  /** Venue-local "YYYY-MM-DD": when set, each ground lists its free slots that day. */
  date?: string;
  sort: GroundSort;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type RawParams = Record<string, string | string[] | undefined>;

/** Keeps only values turf-api accepts; anything else is ignored rather than erroring. */
export function parseGroundsQuery(params: RawParams): GroundsQuery {
  const one = <T extends string>(key: string, allowed: readonly T[]) => {
    const v = params[key];
    return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : undefined;
  };
  return {
    sport: one("sport", SPORTS),
    format: one("format", FORMATS),
    surface: one("surface", SURFACES),
    date: typeof params.date === "string" && ISO_DATE.test(params.date) ? params.date : undefined,
    sort: one("sort", SORTS) ?? "recommended",
  };
}

/** /grounds URL for the current query with some values changed (undefined removes one). */
export function groundsHref(query: GroundsQuery, change: Partial<GroundsQuery>) {
  const next = { ...query, ...change };
  const params = new URLSearchParams();
  for (const key of ["date", "sport", "format", "surface"] as const) if (next[key]) params.set(key, next[key]);
  if (next.sort !== "recommended") params.set("sort", next.sort);
  const qs = params.toString();
  return qs ? `/grounds?${qs}` : "/grounds";
}

/** "Recommended" keeps turf-api's order (by name). */
export function sortGrounds(grounds: Ground[], sort: GroundSort): Ground[] {
  const list = [...grounds];
  if (sort === "price-asc") list.sort((a, b) => a.hourlyRate - b.hourlyRate);
  if (sort === "price-desc") list.sort((a, b) => b.hourlyRate - a.hourlyRate);
  if (sort === "format") {
    const rank = (g: Ground) => (g.format ? FORMATS.indexOf(g.format) : FORMATS.length);
    list.sort((a, b) => rank(a) - rank(b));
  }
  return list;
}
