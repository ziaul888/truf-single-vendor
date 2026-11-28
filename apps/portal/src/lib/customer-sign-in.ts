import { safeRedirectPath } from "@/lib/safe-redirect";
import { isTurfPortalPage, turfPortalPath } from "@/lib/turf-portal-path";

export const CUSTOMER_SIGN_IN_QUERY = "signIn";

/** Open old sign-in links as a dialog over a customer page in the same turf. */
export function customerSignInRedirect(from: string | null, slug: string | undefined, homePath: string) {
  const origin = "https://portal.local";
  const target = new URL(safeRedirectPath(from, "/my-bookings"), origin);
  const pathname = target.pathname === homePath
    ? "/"
    : slug && target.pathname.startsWith(`${homePath}/`)
      ? target.pathname.slice(homePath.length)
      : target.pathname;

  if (target.origin !== origin || pathname === "/sign-in" || !isTurfPortalPage(pathname)) {
    return `${turfPortalPath(slug, "/my-bookings")}?${CUSTOMER_SIGN_IN_QUERY}=1`;
  }

  const destination = pathname === "/" ? homePath : turfPortalPath(slug, pathname);
  target.searchParams.set(CUSTOMER_SIGN_IN_QUERY, "1");
  return `${destination}${target.search}${target.hash}`;
}
