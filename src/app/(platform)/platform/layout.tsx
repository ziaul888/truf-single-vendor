import type { Metadata } from "next";
import { DEFAULT_TAB_ICONS, tabIcons } from "@/lib/app-icons";
import { getPlatformBranding } from "@/services/tab-branding";

export async function generateMetadata(): Promise<Metadata> {
  const { title, logoUrl } = await getPlatformBranding();
  const description = "Administration for the turf SaaS platform.";
  return {
    title: { default: title, template: `%s · ${title}` },
    description,
    robots: { index: false, follow: false },
    icons: logoUrl ? tabIcons("platform") : DEFAULT_TAB_ICONS,
    appleWebApp: { title },
    openGraph: { title, siteName: title, description, images: [] },
    twitter: { card: "summary", title, description, images: [] },
  };
}

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return children;
}
