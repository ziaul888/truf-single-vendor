import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: "TurfOrg",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            richColors
            position="top-right"
            mobileOffset={{ top: "calc(env(safe-area-inset-top) + 12px)" }}
          />
        </Providers>
      </body>
    </html>
  );
}
