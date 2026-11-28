import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { PRODUCT_NAME } from "@/lib/product-name";
import { SAAS_SCREENSHOT_DETAILS } from "@/lib/saas-screenshots";
import { getPlatformBranding } from "@/services/platform-branding";
import "./saas.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-saas-display",
});

const title = `${PRODUCT_NAME} · Plans and pricing`;
const description = "Compare monthly and yearly plans for turf settings, grounds, slot generation and staff management.";
const image = SAAS_SCREENSHOT_DETAILS.desktop.src.src;

export async function generateMetadata(): Promise<Metadata> {
  const { logoUrl } = await getPlatformBranding();
  return {
    title: { default: title, template: `%s · ${PRODUCT_NAME}` },
    description,
    openGraph: { title, description, siteName: PRODUCT_NAME, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    appleWebApp: null,
    icons: logoUrl ? {
      icon: { url: "/saas/app-icon?size=32", sizes: "32x32", type: "image/png" },
      apple: { url: "/saas/app-icon?size=180", sizes: "180x180", type: "image/png" },
    } : { icon: "/saas/platform-icon.svg", apple: "/saas/platform-icon.svg" },
  };
}

export default function SaasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} bg-background text-foreground min-h-dvh`}>{children}</div>
  );
}
