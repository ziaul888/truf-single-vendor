export const LOGO_TYPES = ["image/png", "image/jpeg"] as const;
export const LOGO_MAX_BYTES = 200 * 1024;

/** Client-side check before uploading; turf-api checks the file contents again. Returns an error or null. */
export function checkLogoFile(file: File): string | null {
  if (!(LOGO_TYPES as readonly string[]).includes(file.type)) return "Use a PNG or JPG image";
  if (file.size > LOGO_MAX_BYTES) return "The logo must be 200 KB or smaller";
  return null;
}
