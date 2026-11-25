import { NextResponse, type NextRequest } from "next/server";
import { DASHBOARD_PATH_HEADER } from "@/lib/turf-portal-path";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const adminToken = req.cookies.get("admin_token")?.value;
  const ownerToken = req.cookies.get("owner_token")?.value;
  if (!adminToken && !ownerToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // The API validates sessions on every protected request.
  const headers = new Headers(req.headers);
  headers.set(DASHBOARD_PATH_HEADER, pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
