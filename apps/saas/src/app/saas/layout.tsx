import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { SAAS_SCREENSHOT_DETAILS } from "@/lib/saas-screenshots";
import { DEFAULT_TAB_ICONS, tabIcons } from "@/lib/app-icons";
import { getPlatformBranding } from "@/services/platform-branding";
import "./saas.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-saas-display",
});

const title = "TurfOrg · Plans and pricing";
const description = "Compare monthly and yearly plans for turf settings, grounds, slot generation and staff management.";
const image = SAAS_SCREENSHOT_DETAILS.desktop.src.src;

export async function generateMetadata(): Promise<Metadata> {
  const { logoUrl } = await getPlatformBranding();
  return {
    title: { default: title, template: "%s · TurfOrg" },
    description,
    openGraph: { title, description, siteName: "TurfOrg", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    appleWebApp: null,
    icons: logoUrl ? tabIcons("platform") : DEFAULT_TAB_ICONS,
  };
}

export default function SaasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} bg-background text-foreground min-h-dvh`}>{children}</div>
  );
}
