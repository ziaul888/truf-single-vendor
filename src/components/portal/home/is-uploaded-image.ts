/**
 * Images uploaded from the admin are served by our own API with a ?v= cache key,
 * so they skip the Next.js image optimizer.
 */
export function isUploadedImage(src: string) {
  return src.startsWith("/");
}
