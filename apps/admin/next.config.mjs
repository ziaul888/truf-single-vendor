import { fileURLToPath } from "node:url";

const api = process.env.API_PROXY_TARGET ?? "http://localhost:4000";
const portal = new URL(process.env.NEXT_PUBLIC_PORTAL_ORIGIN ?? "http://localhost:3000").origin;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  allowedDevOrigins: ["192.168.*.*"],
  assetPrefix: "/admin-static",
  env: { NEXT_PUBLIC_PORTAL_ORIGIN: portal },
  turbopack: { root: fileURLToPath(new URL("../..", import.meta.url)) },
  images: {
    path: "/admin-static/_next/image",
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  async redirects() {
    return [
      { source: "/", destination: "/admin", permanent: false },
      { source: "/businesses/:path*", destination: "/dashboard", permanent: false },
      { source: "/turf", destination: `${portal}/turf`, permanent: false },
      { source: "/turf/:path+", destination: `${portal}/turf/:path+`, permanent: false },
      { source: "/saas", destination: `${portal}/saas`, permanent: false },
      { source: "/saas/:path+", destination: `${portal}/saas/:path+`, permanent: false },
      { source: "/app-icon", destination: "/admin-icon", permanent: false },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/admin", destination: "/dashboard" },
        { source: "/admin/:path+", destination: "/dashboard/:path+" },
        { source: "/admin-static/_next/image", destination: "/_next/image" },
      ],
      afterFiles: [{ source: "/api/v1/:path+", destination: `${api}/api/v1/:path+` }],
      fallback: [],
    };
  },
};

export default nextConfig;
