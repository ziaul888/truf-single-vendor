import { NextResponse, type NextRequest } from "next/server";

const ADMIN_PREFIX = "/dashboard";
const ADMIN_LOGIN = "/login";
const ADMIN_HOSTS = new Set(["turfadmin-panel.vercel.app"]);

/**
 * Route-group-aware auth gate.
 *
 * Customer pages under (portal) — public, no auth required.
 * Admin pages under (admin)/dashboard — require an admin JWT cookie.
 * /login — admin sign-in, always public.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
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

  if (!pathname.startsWith(ADMIN_PREFIX)) {
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
  matcher: ["/", "/dashboard/:path*", "/platform/:path*"],
};
