import type { Metadata, MetadataRoute } from "next";

export type IconSource = "owner" | "platform" | { turf: string };

export function appIconUrl(size: number, source?: IconSource, path = "/app-icon") {
  const params = new URLSearchParams({ size: String(size) });
  if (typeof source === "string") params.set("brand", source);
  else if (source) params.set("turf", source.turf);
  return `${path}?${params}`;
}

export function tabIcons(source?: IconSource, path?: string): NonNullable<Metadata["icons"]> {
  return {
    icon: { url: appIconUrl(32, source, path), sizes: "32x32", type: "image/png" },
    apple: { url: appIconUrl(180, source, path), sizes: "180x180", type: "image/png" },
  };
}

export const DEFAULT_TAB_ICONS = { icon: "/platform-icon.svg", apple: "/platform-icon.svg" };

/** Home-screen icons for both installable apps, drawn by /app-icon from the venue's logo. */
export const appIcons = (path = "/app-icon"): MetadataRoute.Manifest["icons"] => [
  { src: `${path}?size=192`, sizes: "192x192", type: "image/png", purpose: "any" },
  { src: `${path}?size=512`, sizes: "512x512", type: "image/png", purpose: "any" },
  { src: `${path}?size=512&maskable=1`, sizes: "512x512", type: "image/png", purpose: "maskable" },
];
