import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./saas.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-saas-display",
});

const title = "TurfOrg · Plans and pricing";
const description = "Compare monthly and yearly plans for turf settings, grounds, slot generation and staff management.";
const image = "/saas/booking-site-desktop.jpg";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  openGraph: { title, description, siteName: "TurfOrg", images: [image] },
  twitter: { card: "summary_large_image", title, description, images: [image] },
  appleWebApp: null,
  icons: null,
};

export default function SaasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} bg-background text-foreground min-h-dvh`}>{children}</div>
  );
}
