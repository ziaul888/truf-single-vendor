import { fileURLToPath } from "node:url";

const api = new URL(process.env.API_PROXY_TARGET ?? "http://localhost:4000").origin;
const saas = new URL(process.env.SAAS_APP_ORIGIN ?? "http://localhost:3001").origin;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  assetPrefix: "/platform-static",
  turbopack: { root: fileURLToPath(new URL("../..", import.meta.url)) },
  images: {
    path: "/platform-static/_next/image",
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return ["/platform/:path*", "/api/:path*"].map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }));
  },
  async redirects() {
    return [
      { source: "/", destination: "/platform", permanent: false },
      { source: "/saas", destination: `${saas}/saas`, permanent: false },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/platform-static/_next/image", destination: "/_next/image" },
      ],
      afterFiles: ["/api/v1/platform/:path+", "/api/v1/uploads/:path+"].map((source) => ({
        source,
        destination: `${api}${source}`,
      })),
      fallback: [],
    };
  },
};

export default nextConfig;
