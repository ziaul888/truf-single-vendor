import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.url("Enter a full URL starting with https://")]);
const text = (max: number, required?: string) =>
  required
    ? z.string().trim().min(1, required).max(max, `Keep it under ${max} characters`)
    : z.string().trim().max(max, `Keep it under ${max} characters`);

/* ---------- Uploaded images ---------- */

export const WEBSITE_IMAGE_SLOTS = ["hero", "visit"] as const;
export type WebsiteImageSlot = (typeof WEBSITE_IMAGE_SLOTS)[number];
export const WEBSITE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
/** Limit for the file the admin picks, before it's resized in the browser. */
export const WEBSITE_IMAGE_MAX_PICK_BYTES = 10 * 1024 * 1024;
/** Limit for the resized file the server accepts. */
export const WEBSITE_IMAGE_MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export function websiteImagePath(slot: WebsiteImageSlot) {
  return `/api/settings/website/images/${slot}`;
}

/** An image uploaded through our API, or any https image link. */
export function isWebsiteImageSrc(value: string | undefined): boolean {
  if (!value) return false;
  if (WEBSITE_IMAGE_SLOTS.some((slot) => value.startsWith(`${websiteImagePath(slot)}?v=`))) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

const imageSrc = z.string().refine(isWebsiteImageSrc, "Upload an image or enter a link starting with https://");

/* ---------- Amenity icons ---------- */

export const AMENITY_ICON_KEYS = [
  "parking", "showers", "lockers", "cafe", "wifi", "firstAid", "floodlights", "seating", "water", "changing",
] as const;
export type AmenityIconKey = (typeof AMENITY_ICON_KEYS)[number];

/* ---------- Settings ---------- */

export const WebsiteHeroSchema = z.object({
  badge: text(40),
  headline: text(60, "Add a headline"),
  description: text(280),
  imageUrl: imageSrc,
});

export const WebsiteContactSchema = z.object({
  venueName: z.string().trim().min(2, "Add the venue name").max(60),
  tagline: text(40),
  address: z.string().trim().min(5, "Add the full address").max(160),
  phone: z.string().trim().min(10, "Enter a valid phone number").max(20),
  email: z.email("Enter a valid email"),
  openHours: text(40, "Add opening hours"),
  mapUrl: optionalUrl,
});

export const WebsiteSectionsSchema = z.object({
  sportChips: z.object({
    enabled: z.boolean(),
    title: text(60, "Add a title"),
  }),
  featuredGrounds: z.object({
    enabled: z.boolean(),
    title: text(60, "Add a title"),
    subtitle: text(120),
  }),
  amenities: z.object({
    enabled: z.boolean(),
    title: text(60, "Add a title"),
    subtitle: text(160),
    items: z
      .array(z.object({ icon: z.enum(AMENITY_ICON_KEYS), label: text(30, "Add a label") }))
      .min(1, "Add at least one amenity")
      .max(12, "Up to 12 amenities"),
  }),
  howItWorks: z.object({
    enabled: z.boolean(),
    badge: text(30),
    title: text(60, "Add a title"),
    steps: z
      .array(z.object({ title: text(40, "Add a step title"), body: text(200, "Describe this step") }))
      .length(3),
    buttonLabel: text(30, "Add the button text"),
  }),
  visitUs: z.object({
    enabled: z.boolean(),
    badge: text(30),
    title: text(80, "Add a title"),
    imageUrl: imageSrc,
  }),
});

export const WebsiteSocialSchema = z.object({
  facebook: optionalUrl,
  instagram: optionalUrl,
  whatsapp: optionalUrl,
});

export const WebsiteSettingsSchema = z.object({
  hero: WebsiteHeroSchema,
  contact: WebsiteContactSchema,
  sections: WebsiteSectionsSchema,
  social: WebsiteSocialSchema,
});

export type WebsiteSettings = z.infer<typeof WebsiteSettingsSchema>;
export type WebsiteSections = WebsiteSettings["sections"];
export type WebsiteSectionKey = keyof WebsiteSections;
