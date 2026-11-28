import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { siteUrl } from "@/lib/site-url";
import { DEFAULT_TAB_ICONS } from "@/lib/app-icons";
import { PRODUCT_NAME } from "@/lib/product-name";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

/** Phones first: `cover` lets sticky bottom bars pad for the home indicator with env(safe-area-inset-bottom). */
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: PRODUCT_NAME,
  applicationName: PRODUCT_NAME,
  alternates: { canonical: "./" },
  icons: DEFAULT_TAB_ICONS,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={inter.className}>
        <Providers themeStorageKey="portal-theme">
          {children}
          {/* Full screen on a phone, toasts clear the status bar. */}
          <Toaster richColors position="top-right" mobileOffset={{ top: "calc(env(safe-area-inset-top) + 12px)" }} />
        </Providers>
      </body>
    </html>
  );
}
