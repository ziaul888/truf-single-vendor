export const TURF_PORTAL_HEADER = "x-turf-portal-slug";

export function isTurfPortalSlug(slug: string) {
  return slug.length <= 50 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function turfPortalPath(slug?: string, path = "/"): string {
  if (!slug || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/turf/")) return path;
  const base = `/turf/${encodeURIComponent(slug)}`;
  return path === "/" ? base : `${base}${path}`;
}

export function turfPortalApiPrefix(slug?: string) {
  return slug ? `/turfs/${encodeURIComponent(slug)}` : "";
}

/** A shareable turf URL may only target a page in the existing portal group. */
export function turfPortalSlugForPath(pathname: string) {
  const match = /^\/turf\/([^/]+)(\/.*)?$/.exec(pathname);
  if (!match || !isTurfPortalSlug(match[1])) return null;
  const page = match[2] || "/";
  if (!/^(?:\/|\/(?:grounds|checkout|sign-in|my-bookings|account)|\/(?:grounds|confirmation)\/[a-f0-9-]{36})$/.test(page))
    return null;
  return match[1];
}
