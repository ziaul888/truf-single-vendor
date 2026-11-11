import type { MetadataRoute } from "next";

/** Home-screen icons for both installable apps, drawn by /app-icon from the venue's logo. */
export const appIcons = (): MetadataRoute.Manifest["icons"] => [
  { src: "/app-icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/app-icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/app-icon?size=512&maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
];
