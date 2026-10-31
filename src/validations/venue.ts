import { z } from "zod";
import type { VenueInput, VenueProfile } from "@/types/settings";

const httpsOrEmpty = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https:\/\/\S+\.\S+$/.test(v), "Use a full https:// link, or leave it empty");

/** The venue profile form; the same rules turf-api checks on PUT /admin/settings/venue. */
export const VenueSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(60, "At most 60 characters"),
  tagline: z.string().trim().max(40, "At most 40 characters"),
  phone: z.string().trim().min(10, "At least 10 characters").max(20, "At most 20 characters"),
  email: z.email("Enter a valid email"),
  /** "" in the form; sent as null so replies go to `email`. */
  supportEmail: z.union([z.literal(""), z.email("Enter a valid email, or leave it empty")]),
  address: z.string().trim().min(5, "At least 5 characters").max(160, "At most 160 characters"),
  openHours: z.string().trim().min(1, "Required").max(40, "At most 40 characters"),
  mapUrl: httpsOrEmpty,
  websiteUrl: httpsOrEmpty,
});
export type VenueForm = z.infer<typeof VenueSchema>;

export const toVenueForm = (v: VenueProfile): VenueForm => ({
  name: v.name,
  tagline: v.tagline,
  phone: v.phone,
  email: v.email,
  supportEmail: v.supportEmail ?? "",
  address: v.address,
  openHours: v.openHours,
  mapUrl: v.mapUrl,
  websiteUrl: v.websiteUrl,
});

/** Editable fields only: logo, locale and audit fields never go in the PUT. */
export const fromVenueForm = (f: VenueForm): VenueInput => ({ ...f, supportEmail: f.supportEmail || null });

export const LOGO_TYPES = ["image/png", "image/jpeg"] as const;
export const LOGO_MAX_BYTES = 200 * 1024;

/** Client-side check before uploading; turf-api checks the file contents again. Returns an error or null. */
export function checkLogoFile(file: File): string | null {
  if (!(LOGO_TYPES as readonly string[]).includes(file.type)) return "Use a PNG or JPG image";
  if (file.size > LOGO_MAX_BYTES) return "The logo must be 200 KB or smaller";
  return null;
}
