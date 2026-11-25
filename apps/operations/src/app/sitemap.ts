import type { MetadataRoute } from "next";
import { listPublicGrounds } from "@/services/portal-grounds";
import { getTurfPortalHome } from "@/services/turf-portal-request";
import { siteUrl } from "@/lib/site-url";
import { saasAppOrigin } from "@/lib/saas-app-origin.mjs";

// Grounds change from the dashboard; build it per request (the grounds fetch itself is cached for 60 s).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteUrl().origin;
  const grounds = await listPublicGrounds();
  const portalHome = await getTurfPortalHome();
  return [
    { url: origin, changeFrequency: "weekly", priority: 1 },
    { url: `${saasAppOrigin}/`, changeFrequency: "monthly", priority: 0.7 },
    ...(portalHome === "/" ? [] : [{ url: `${origin}${portalHome}`, changeFrequency: "weekly" as const, priority: 0.8 }]),
    // With one ground, /grounds redirects to it, so it isn't a page of its own.
    ...(grounds.length > 1
      ? [{ url: `${origin}/grounds`, changeFrequency: "weekly" as const, priority: 0.8 }]
      : []),
    ...grounds.map((g) => ({
      url: `${origin}/grounds/${g.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
