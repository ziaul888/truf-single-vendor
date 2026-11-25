import { fileURLToPath } from "node:url";

const api = new URL(process.env.API_PROXY_TARGET ?? "http://localhost:4000").origin;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  turbopack: { root: fileURLToPath(new URL("../..", import.meta.url)) },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/saas" }],
      afterFiles: [
        "/api/v1/owner-applications/:path*",
        "/api/v1/platform/branding",
        "/api/v1/platform/landing-screenshots",
        "/api/v1/uploads/:path*",
      ].map((source) => ({ source, destination: `${api}${source}` })),
      fallback: [],
    };
  },
};

export default nextConfig;
