import { NextResponse, type NextRequest } from "next/server";
import {
  CUSTOMER_PORTAL_HOME, CUSTOMER_PORTAL_HOME_HEADER, DASHBOARD_PATH_HEADER, isLocalHost, isTurfPortalPage,
  PLATFORM_ADMIN_HOST, SAAS_PRODUCTION_ORIGIN, TURF_OWNER_HOSTS, TURF_PORTAL_HEADER,
  turfPortalPath, turfPortalSlugForHost, turfPortalSlugForPath,
} from "@/lib/turf-portal-path";
import { getDefaultTurf } from "@/services/turf-portal-request";

const ADMIN_PREFIX = "/dashboard";
const OWNER_ENTRY = "/admin";
const ADMIN_LOGIN = "/login";

function redirectToPublicTurf(req: NextRequest, slug: string, pathname: string) {
  const url = new URL(turfPortalPath(slug, pathname), SAAS_PRODUCTION_ORIGIN);
  url.search = req.nextUrl.search;
  return NextResponse.redirect(url);
}

function passToTurfPortal(req: NextRequest, slug: string) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(TURF_PORTAL_HEADER, slug);
  requestHeaders.delete(CUSTOMER_PORTAL_HOME_HEADER);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

/**
 * Route-group-aware auth gate.
 *
 * Customer pages under (portal) — public, no auth required.
 * Admin pages under (admin)/dashboard — require an admin JWT cookie.
 * /login — admin sign-in, always public.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const turfSlug = turfPortalSlugForPath(pathname);
  const aliasSlug = turfPortalSlugForHost(host);
  if (aliasSlug) {
    if (turfSlug === aliasSlug || isTurfPortalPage(pathname)) {
      return redirectToPublicTurf(req, aliasSlug, pathname);
    }
    return new NextResponse(null, { status: 404 });
  }

  if (turfSlug && (TURF_OWNER_HOSTS.has(host) || host === PLATFORM_ADMIN_HOST)) {
    return redirectToPublicTurf(req, turfSlug, pathname);
  }
  if (turfSlug) return passToTurfPortal(req, turfSlug);
  const local = isLocalHost(host);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.delete(TURF_PORTAL_HEADER);
  requestHeaders.delete(CUSTOMER_PORTAL_HOME_HEADER);
  if (!local || pathname === CUSTOMER_PORTAL_HOME) {
    requestHeaders.set(CUSTOMER_PORTAL_HOME_HEADER, CUSTOMER_PORTAL_HOME);
  }
  const isAdminHost = host.startsWith("admin.") || TURF_OWNER_HOSTS.has(host);
  const platformRoot = (host === PLATFORM_ADMIN_HOST || host.startsWith("manage.")) && pathname === "/";
  const platformPage = pathname === "/platform" || pathname.startsWith("/platform/");
  if (platformRoot || platformPage) {
    if (pathname === "/platform/login") return NextResponse.next();
    const url = req.nextUrl.clone();
    if (!req.cookies.get("platform_token")?.value) {
      url.pathname = "/platform/login";
      url.searchParams.set("from", platformRoot ? "/platform" : pathname);
      return NextResponse.redirect(url);
    }
    if (platformRoot) {
      url.pathname = "/platform";
      return host === PLATFORM_ADMIN_HOST ? NextResponse.redirect(url) : NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  if (isAdminHost && pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = OWNER_ENTRY;
    return NextResponse.redirect(url);
  }

  if (pathname === "/" && local) {
    const slug = await getDefaultTurf();
    if (slug) return passToTurfPortal(req, slug);
  }

  if (pathname === "/" && !local) {
    const url = req.nextUrl.clone();
    url.pathname = "/saas";
    return NextResponse.redirect(url);
  }

  if (pathname === CUSTOMER_PORTAL_HOME) {
    const slug = await getDefaultTurf();
    if (slug) {
      const url = req.nextUrl.clone();
      url.pathname = turfPortalPath(slug);
      return NextResponse.redirect(url);
    }
  }

  const isOwnerEntry = pathname === OWNER_ENTRY || pathname.startsWith(`${OWNER_ENTRY}/`);
  const isDashboard = pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
  if (!isOwnerEntry && !isDashboard) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const adminToken = req.cookies.get("admin_token")?.value;
  const ownerToken = req.cookies.get("owner_token")?.value;
  if (!adminToken && !ownerToken) {
    const url = req.nextUrl.clone();
    url.pathname = ADMIN_LOGIN;
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Presence check only: turf-api verifies the token on every request, and a 401
  // there sends the user back to /login. The frontend never holds JWT_SECRET.
  requestHeaders.set(DASHBOARD_PATH_HEADER, pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/", "/admin/:path*", "/dashboard/:path*", "/platform/:path*", "/turf/:path*", "/grounds/:path*",
    "/checkout", "/confirmation/:path*", "/account", "/my-bookings", "/sign-in",
  ],
};
