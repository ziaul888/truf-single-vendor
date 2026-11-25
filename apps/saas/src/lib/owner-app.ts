import "server-only";

export function ownerAppUrl(path: "/admin" | "/login") {
  const origin = process.env.OWNER_APP_ORIGIN ?? (process.env.VERCEL ? "https://admin-turforg.vercel.app" : "http://localhost:3000");
  return new URL(path, origin).href;
}
