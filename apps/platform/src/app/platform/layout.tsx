import type { Metadata } from "next";
import { getPlatformBranding } from "@/services/platform-branding";

export async function generateMetadata(): Promise<Metadata> {
  const { title, logoUrl } = await getPlatformBranding();
  const description = "Administration for the turf SaaS platform.";
  return {
    title: { default: title, template: `%s · ${title}` },
    description,
    robots: { index: false, follow: false },
    icons: logoUrl
      ? {
          icon: { url: "/platform/app-icon?size=32", sizes: "32x32", type: "image/png" },
          apple: { url: "/platform/app-icon?size=180", sizes: "180x180", type: "image/png" },
        }
      : { icon: "/platform/platform-icon.svg", apple: "/platform/platform-icon.svg" },
    appleWebApp: { title },
    openGraph: { title, siteName: title, description, images: [] },
    twitter: { card: "summary", title, description, images: [] },
  };
}

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return children;
}
