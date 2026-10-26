import { websiteImagePath, type WebsiteImageSlot } from "@/validations/website-settings";

// In-memory store for uploaded website images until real file storage exists
// (e.g. Vercel Blob or S3). Resets on every server restart or deploy.

export interface StoredWebsiteImage {
  bytes: Uint8Array;
  contentType: string;
  version: number;
}

const store = globalThis as typeof globalThis & {
  __websiteImages?: Partial<Record<WebsiteImageSlot, StoredWebsiteImage>>;
};

export function getWebsiteImage(slot: WebsiteImageSlot): StoredWebsiteImage | undefined {
  return store.__websiteImages?.[slot];
}

/** Saves the image and returns the URL the website settings should point at. */
export function saveWebsiteImage(slot: WebsiteImageSlot, bytes: Uint8Array, contentType: string): string {
  const version = Date.now();
  store.__websiteImages = { ...store.__websiteImages, [slot]: { bytes, contentType, version } };
  return `${websiteImagePath(slot)}?v=${version}`;
}
