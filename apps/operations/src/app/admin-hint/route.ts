import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Whether the visitor holds an admin session cookie (the httpOnly cookie can't be read in the browser).
 * The portal asks this after it loads, so its pages don't read cookies themselves and can be cached.
 */
export async function GET() {
  const isAdmin = Boolean((await cookies()).get("admin_token")?.value);
  return NextResponse.json({ isAdmin }, { headers: { "Cache-Control": "private, no-store" } });
}
