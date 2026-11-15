import type { Metadata } from "next";

/** The share image: the venue's logo on white, or its initial until one is uploaded (app-icon route). */
const SHARE_IMAGE = { url: "/app-icon?size=512", width: 512, height: 512 };

/** Open Graph and Twitter tags for a page. `title` is the full text shown in the share card. */
export function socialMetadata({ title, description, siteName }: { title: string; description: string; siteName: string }): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: { type: "website", siteName, title, description, images: [SHARE_IMAGE] },
    twitter: { card: "summary", title, description, images: [SHARE_IMAGE.url] },
  };
}

/** Page description with the venue's location when it has one. */
export function venueDescription(name: string, address: string): string {
  const where = address.trim() ? ` in ${address.trim()}` : "";
  return `Book hourly turf slots at ${name}${where}. See live availability and reserve in a few taps.`;
}
