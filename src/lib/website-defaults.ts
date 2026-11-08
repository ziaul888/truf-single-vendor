import type { WebsiteSettings } from "@/validations/website-settings";
import type { PublicVenue } from "@/types/settings";

/**
 * turf-api's own defaults for a fresh install. Used for "Use default" on the image
 * fields, and as a fallback so the portal still renders if turf-api is unreachable.
 */
export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  hero: {
    badge: "BOOK IN 60 SECONDS",
    headline: "Welcome to",
    description:
      "See which slots are free right now and book your ground in a minute.",
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1920",
  },
  sections: {
    sportChips: { enabled: true, title: "Browse by sport" },
    featuredGrounds: { enabled: true, title: "Our grounds", subtitle: "Pick the field that fits your match" },
    amenities: {
      // Example items only: off until the admin edits them to what the venue really has.
      enabled: false,
      title: "More than just a pitch",
      subtitle: "Everything you need at the venue, included with every booking.",
      items: [
        { icon: "parking", label: "Free parking" },
        { icon: "showers", label: "Showers" },
        { icon: "lockers", label: "Locker rooms" },
        { icon: "cafe", label: "On-site café" },
        { icon: "wifi", label: "Free Wi-Fi" },
        { icon: "firstAid", label: "First aid" },
      ],
    },
    howItWorks: {
      enabled: true,
      badge: "HOW IT WORKS",
      title: "Three steps to your match",
      steps: [
        { title: "Pick a ground", body: "Choose the ground and sport that fit your match." },
        { title: "Pick a slot & pay", body: "See open slots in real time and pay the way that suits you." },
        { title: "Show up & play", body: "Your booking link arrives by email. Use it to check your booking, or to cancel it before the cancellation cutoff." },
      ],
      buttonLabel: "Browse our grounds",
    },
    visitUs: {
      enabled: true,
      badge: "VISIT US",
      title: "Come and play",
      imageUrl: "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=1200",
    },
  },
  social: {
    facebook: "",
    instagram: "",
    whatsapp: "",
  },
};

/** Shown only if turf-api is unreachable. */
export const FALLBACK_VENUE: PublicVenue = {
  name: "Champions Turf",
  tagline: "",
  phone: "",
  email: "",
  address: "",
  openHours: "",
  mapUrl: "",
  websiteUrl: "",
  logoUrl: null,
  locale: { currency: "BDT", timezone: "Asia/Dhaka", weekStartsOn: "sat" },
};
