import { z } from "zod";

const optionalUrl = z.union([z.literal(""), z.url("Enter a full URL starting with https://")]);
const text = (max: number, required?: string) =>
  required
    ? z.string().trim().min(1, required).max(max, `Keep it under ${max} characters`)
    : z.string().trim().max(max, `Keep it under ${max} characters`);

/* ---------- Uploaded images ---------- */

/** turf-api's upload slots: the hero background and the "Visit us" photo. */
export const WEBSITE_IMAGE_SLOTS = ["hero", "visit"] as const;
export type WebsiteImageSlot = (typeof WEBSITE_IMAGE_SLOTS)[number];
/** Uploaded website images are served by turf-api through the /api/v1 proxy. */
export const isUploadedWebsiteImage = (value: string | undefined) => !!value?.startsWith("/api/v1/uploads/");

/** An image uploaded through turf-api, or any https image link. */
export function isWebsiteImageSrc(value: string | undefined): boolean {
  if (!value) return false;
  if (isUploadedWebsiteImage(value)) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

const imageSrc = z.string().refine(isWebsiteImageSrc, "Upload an image or enter a link starting with https://");

/** A direct https link to an .mp4 or .webm file (a query string is allowed). Empty = no video. */
export function isHeroVideoUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /\.(mp4|webm)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

const heroVideoUrl = z
  .string()
  .trim()
  .max(500, "Keep the link under 500 characters")
  .refine((v) => v === "" || isHeroVideoUrl(v), "Use a direct https link to an .mp4 or .webm file, not a YouTube link");

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
  videoUrl: heroVideoUrl,
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
  sections: WebsiteSectionsSchema,
  social: WebsiteSocialSchema,
});

/** The editable website content. Venue contact details live in the venue profile (General). */
export type WebsiteSettings = z.infer<typeof WebsiteSettingsSchema>;
export type WebsiteSections = WebsiteSettings["sections"];
export type WebsiteSectionKey = keyof WebsiteSections;
