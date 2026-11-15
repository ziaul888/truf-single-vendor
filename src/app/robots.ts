import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/** Pages with no value in search (and, for the dashboard and confirmations, private). */
const PRIVATE_PATHS = ["/dashboard", "/login", "/sign-in", "/checkout", "/confirmation", "/my-bookings", "/account", "/api"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
    sitemap: `${siteUrl().origin}/sitemap.xml`,
  };
}
