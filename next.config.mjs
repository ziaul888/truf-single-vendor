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
  // Browser calls /api/v1/* on this origin; Next forwards them to turf-api so
  // the httpOnly admin_token cookie stays first-party (no CORS needed).
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
