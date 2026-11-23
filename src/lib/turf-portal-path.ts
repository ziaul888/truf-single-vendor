export const TURF_PORTAL_HEADER = "x-turf-portal-slug";
export const CUSTOMER_PORTAL_HOME = "/turf";
export const CUSTOMER_PORTAL_HOME_HEADER = "x-turf-portal-home";
export const SAAS_PRODUCTION_ORIGIN = "https://turforg.vercel.app";
export const PLATFORM_ADMIN_HOST = "platform-turforg.vercel.app";
export const TURF_OWNER_HOSTS = new Set(["admin-turforg.vercel.app", "turfadmin-panel.vercel.app"]);

const TURF_ALIAS_SUFFIX = "-turforg.vercel.app";
const RESERVED_TURF_ALIASES = new Set(["admin", "platform"]);

export function isLocalHost(host: string) {
  return /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);
}

export function isTurfPortalSlug(slug: string) {
  return slug.length <= 50 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function turfPortalSlugForHost(host: string) {
  const hostname = host.toLowerCase();
  if (!hostname.endsWith(TURF_ALIAS_SUFFIX)) return null;
  const slug = hostname.slice(0, -TURF_ALIAS_SUFFIX.length);
  return isTurfPortalSlug(slug) && !RESERVED_TURF_ALIASES.has(slug) ? slug : null;
}

export function turfPortalPublicUrl(slug: string, origin: string) {
  const host = new URL(origin).host;
  const managedHost = TURF_OWNER_HOSTS.has(host) || host === PLATFORM_ADMIN_HOST;
  return new URL(turfPortalPath(slug), managedHost ? SAAS_PRODUCTION_ORIGIN : origin).href;
}

export function turfPortalPath(slug?: string, path = "/"): string {
  if (!slug || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/turf/"))
    return path;
  const base = `/turf/${encodeURIComponent(slug)}`;
  return path === "/" ? base : `${base}${path}`;
}

export function turfPortalApiPrefix(slug?: string) {
  return slug ? `/turfs/${encodeURIComponent(slug)}` : "";
}

export function isTurfPortalPage(pathname: string) {
  return /^(?:\/|\/(?:grounds|checkout|sign-in|my-bookings|account)|\/(?:grounds|confirmation)\/[a-f0-9-]{36})$/.test(
    pathname
  );
}

/** A shareable turf URL may only target a page in the existing portal group. */
export function turfPortalSlugForPath(pathname: string) {
  const match = /^\/turf\/([^/]+)(\/.*)?$/.exec(pathname);
  if (!match || !isTurfPortalSlug(match[1]) || !isTurfPortalPage(match[2] || "/")) return null;
  return match[1];
}
