import { fileURLToPath } from "node:url";
import { saasAppOrigin } from "./src/lib/saas-app-origin.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: { root: fileURLToPath(new URL("../..", import.meta.url)) },
  // Keep the fixed mobile navigation and checkout actions clear in local previews.
  devIndicators: false,
  // Dev only: lets a phone on the local network load the dev server. Without it, Next blocks
  // the HMR socket from a LAN IP and the pages never hydrate.
  allowedDevOrigins: ["192.168.*.*"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Private pages stay out of search results even if a crawler is linked to them (robots.txt only asks it not to crawl).
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      "/admin/:path*",
      "/dashboard/:path*",
      "/platform/:path*",
      "/login",
      "/sign-in",
      "/checkout/:path*",
      "/confirmation/:path*",
      "/my-bookings",
      "/account",
      "/turf/:slug/sign-in",
      "/turf/:slug/checkout",
      "/turf/:slug/confirmation/:path*",
      "/turf/:slug/my-bookings",
      "/turf/:slug/account",
      "/api/:path*",
    ].map((source) => ({ source, headers: noindex }));
  },
  // Existing workspace bookmarks open the owner's dashboard.
  async redirects() {
    return [{ source: "/businesses/:path*", destination: "/dashboard", permanent: false }];
  },
  // Staff and platform calls stay on this origin; Next forwards them to turf-api
  // so their separate httpOnly session cookies remain first-party.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/turf", destination: "/" },
        { source: "/admin/:path*", destination: "/dashboard/:path*" },
        {
          source: "/turf/:slug/:path*",
          destination: "/:path*",
          has: [{ type: "header", key: "x-turf-portal-slug" }],
        },
      ],
      afterFiles: [
        { source: "/saas", destination: `${saasAppOrigin}/saas` },
        { source: "/saas/:path+", destination: `${saasAppOrigin}/saas/:path+` },
        { source: "/saas-static/:path+", destination: `${saasAppOrigin}/saas-static/:path+` },
        {
          source: "/api/v1/:path*",
          destination: `${process.env.API_PROXY_TARGET ?? "http://localhost:4000"}/api/v1/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
