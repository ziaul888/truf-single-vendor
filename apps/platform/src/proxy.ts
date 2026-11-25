import { NextResponse, type NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (
    pathname === "/platform/login" ||
    pathname === "/platform/app-icon" ||
    pathname === "/platform/platform-icon.svg" ||
    req.cookies.get("platform_token")?.value
  ) {
    return NextResponse.next();
  }

  const login = req.nextUrl.clone();
  login.pathname = "/platform/login";
  login.search = "";
  login.searchParams.set("from", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: "/platform/:path*",
};
