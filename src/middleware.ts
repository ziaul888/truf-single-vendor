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
export function middleware(req: NextRequest) {
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

  // TODO: verify JWT signature against JWT_SECRET. The route handler can also re-verify.
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
