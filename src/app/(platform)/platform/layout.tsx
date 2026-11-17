import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "SaaS Admin", template: "%s · SaaS Admin" },
  description: "Administration for the turf SaaS platform.",
  robots: { index: false, follow: false },
  icons: { icon: "/platform-icon.svg", apple: "/platform-icon.svg" },
  appleWebApp: { title: "SaaS Admin" },
  openGraph: {
    title: "SaaS Admin",
    siteName: "SaaS Admin",
    description: "Platform administration",
    images: [],
  },
  twitter: {
    card: "summary",
    title: "SaaS Admin",
    description: "Platform administration",
    images: [],
  },
};
export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return children;
}
