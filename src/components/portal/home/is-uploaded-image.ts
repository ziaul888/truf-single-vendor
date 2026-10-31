/**
 * Images uploaded from the admin are served by turf-api through the same-origin
 * /api/v1 proxy (a new file name on every upload), so they skip the Next.js image optimizer.
 */
export function isUploadedImage(src: string) {
  return src.startsWith("/");
}
