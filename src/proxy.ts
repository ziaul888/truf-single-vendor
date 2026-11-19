import { NextResponse, type NextRequest } from "next/server";
import { isTurfPortalSlug, TURF_PORTAL_HEADER, turfPortalSlugForPath } from "@/lib/turf-portal-path";

const ADMIN_PREFIX = "/dashboard";
const ADMIN_LOGIN = "/login";
const ADMIN_HOSTS = new Set(["turfadmin-panel.vercel.app"]);
const LOCAL_HOST = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;

function passToTurfPortal(req: NextRequest, slug: string) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(TURF_PORTAL_HEADER, slug);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

async function getLocalHomeTurf() {
  try {
    const api = process.env.API_PROXY_TARGET ?? "http://localhost:4000";
    const response = await fetch(new URL("/api/v1/turfs/default", api), {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return undefined;
    const { data, success } = await response.json();
    const slug = data?.slug;
    return success && typeof slug === "string" && isTurfPortalSlug(slug) ? slug : undefined;
  } catch {
    return undefined;
  }
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
  const turfSlug = turfPortalSlugForPath(pathname);
  if (turfSlug) return passToTurfPortal(req, turfSlug);
  const host = req.headers.get("host") ?? "";
  const isAdminHost = host.startsWith("admin.") || ADMIN_HOSTS.has(host);
  const platformRoot = host.startsWith("manage.") && pathname === "/";
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
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  if (isAdminHost && pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = ADMIN_PREFIX;
    return NextResponse.rewrite(url);
  }

  if (pathname === "/" && LOCAL_HOST.test(host)) {
    const slug = await getLocalHomeTurf();
    if (slug) return passToTurfPortal(req, slug);
  }

  if (!pathname.startsWith(ADMIN_PREFIX)) {
    if (req.headers.has(TURF_PORTAL_HEADER)) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.delete(TURF_PORTAL_HEADER);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    return NextResponse.next();
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
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/", "/dashboard/:path*", "/platform/:path*", "/turf/:path*", "/grounds/:path*",
    "/checkout", "/confirmation/:path*", "/account", "/my-bookings", "/sign-in",
  ],
};
