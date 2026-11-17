/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
      "/dashboard/:path*",
      "/platform/:path*",
      "/owner/:path*",
      "/login",
      "/sign-in",
      "/checkout/:path*",
      "/confirmation/:path*",
      "/my-bookings",
      "/account",
      "/api/:path*",
    ]
      .map((source) => ({ source, headers: noindex }))
      .concat([
        { source: "/owner/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }] },
      ]);
  },
  // Existing workspace bookmarks open the owner's dashboard.
  async redirects() {
    return [{ source: "/businesses/:path*", destination: "/dashboard", permanent: false }];
  },
  // Staff and platform calls stay on this origin; Next forwards them to turf-api
  // so their separate httpOnly session cookies remain first-party.
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.API_PROXY_TARGET ?? "http://localhost:4000"}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
