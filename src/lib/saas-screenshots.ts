export const SAAS_SCREENSHOT_SLOTS = ["desktop", "phone"] as const;
export type SaasScreenshotSlot = (typeof SAAS_SCREENSHOT_SLOTS)[number];
export type SaasScreenshots = Record<SaasScreenshotSlot, string | null>;

export const DEFAULT_SAAS_SCREENSHOTS: SaasScreenshots = { desktop: null, phone: null };

export const SAAS_SCREENSHOT_DETAILS = {
  desktop: {
    title: "Desktop screenshot",
    description: "Shown in the browser preview at the top of the landing page.",
    src: "/saas/booking-site-pitch-desktop.jpg",
    alt: "Desktop preview of the turf booking website",
    width: 2000,
    height: 1083,
  },
  phone: {
    title: "Mobile screenshot",
    description: "Shown in the phone preview in the booking section.",
    src: "/saas/booking-site-pitch-phone.jpg",
    alt: "Mobile preview of the turf booking website",
    width: 780,
    height: 1480,
  },
} as const;
