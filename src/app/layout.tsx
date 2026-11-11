import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { getPublicVenue } from "@/services/website-settings";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

/** Phones first: `cover` lets sticky bottom bars pad for the home indicator with env(safe-area-inset-bottom). */
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

/** The tab title and icon follow the venue's name and logo (Settings → General), on the portal and admin alike. */
export async function generateMetadata(): Promise<Metadata> {
  const venue = await getPublicVenue();
  return {
    title: { default: venue.name, template: `%s · ${venue.name}` },
    description: "Check live slot availability and book your turf online.",
    icons: { ...(venue.logoUrl && { icon: venue.logoUrl }), apple: "/app-icon?size=180" },
    // Opened from the home screen it runs full screen, like an app; headers pad for the status bar.
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: venue.name },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={inter.className}>
        <Providers>
          {children}
          {/* Full screen on a phone, toasts clear the status bar. */}
          <Toaster richColors position="top-right" mobileOffset={{ top: "calc(env(safe-area-inset-top) + 12px)" }} />
        </Providers>
      </body>
    </html>
  );
}
