import { WebsiteSettingsSchema, type WebsiteSettings } from "@/validations/website-settings";

// In-memory store until the real backend exists. Kept on globalThis so it
// survives dev hot reloads; it still resets on every server restart or deploy.

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  hero: {
    badge: "BOOK IN 60 SECONDS",
    headline: "Welcome to",
    description:
      "Six fields under one roof — football 5×5 / 6×6 / 7×7, full-size cricket nets and indoor badminton courts. Real-time slot availability, instant confirmation.",
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1920",
  },
  contact: {
    venueName: "Champions Turf",
    tagline: "Banani, Dhaka",
    address: "Plot 7, Road 11, Banani, Dhaka 1213",
    phone: "+880 1700 000 000",
    email: "hello@championsturf.com",
    openHours: "06:00 — 23:00",
    mapUrl: "",
  },
  sections: {
    sportChips: { enabled: true, title: "Browse by sport" },
    featuredGrounds: { enabled: true, title: "Our grounds", subtitle: "Pick the field that fits your match" },
    amenities: {
      enabled: true,
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
        { title: "Pick a ground", body: "Choose from our 6 grounds — football 5×5 / 6×6 / 7×7 / 11×11, cricket nets or badminton." },
        { title: "Pick a slot & pay", body: "Real-time hourly availability. Pay securely via Stripe — card, Apple Pay, Google Pay." },
        { title: "Show up & play", body: "Confirmation lands in your inbox. Free cancellation up to 24h before kickoff." },
      ],
      buttonLabel: "Browse our grounds",
    },
    visitUs: {
      enabled: true,
      badge: "VISIT US",
      title: "One venue. Six grounds. Open 18 hours a day.",
      imageUrl: "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=1200",
    },
  },
  social: {
    facebook: "",
    instagram: "",
    whatsapp: "",
  },
};

const store = globalThis as typeof globalThis & { __websiteSettings?: WebsiteSettings };

export function getWebsiteSettings(): WebsiteSettings {
  // Fall back to defaults if a stored value predates the current schema.
  const parsed = WebsiteSettingsSchema.safeParse(store.__websiteSettings);
  return parsed.success ? parsed.data : DEFAULT_WEBSITE_SETTINGS;
}

export function updateWebsiteSettings(next: WebsiteSettings): WebsiteSettings {
  store.__websiteSettings = next;
  return next;
}
