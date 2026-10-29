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

  if (isAdminHost && pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = ADMIN_PREFIX;
    return NextResponse.rewrite(url);
  }

  if (!pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next();
  }

  const adminToken = req.cookies.get("admin_token")?.value;
  if (!adminToken) {
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
  matcher: ["/", "/dashboard/:path*"],
};
