/** Only follow same-origin paths, so ?from= can't send users to another site. */
export function safeRedirectPath(from: string | null, fallback = "/dashboard") {
  if (!from || !from.startsWith("/")) return fallback;
  if (from.startsWith("//") || from.startsWith("/\\")) return fallback;
  return from;
}
