export const WEBSITE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
/** Limit for the file the admin picks, before it's resized in the browser. */
export const WEBSITE_IMAGE_MAX_PICK_BYTES = 10 * 1024 * 1024;
/** Limit for the resized file turf-api accepts. */
export const WEBSITE_IMAGE_MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
