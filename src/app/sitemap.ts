import type { MetadataRoute } from "next";
import { listPublicGrounds } from "@/services/portal-grounds";
import { siteUrl } from "@/lib/site-url";

// Grounds change from the dashboard; build it per request (the grounds fetch itself is cached for 60 s).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteUrl().origin;
  const grounds = await listPublicGrounds();
  return [
    { url: origin, changeFrequency: "weekly", priority: 1 },
    // With one ground, /grounds redirects to it, so it isn't a page of its own.
    ...(grounds.length > 1 ? [{ url: `${origin}/grounds`, changeFrequency: "weekly" as const, priority: 0.8 }] : []),
    ...grounds.map((g) => ({ url: `${origin}/grounds/${g.id}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
