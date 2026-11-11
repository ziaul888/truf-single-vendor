import type { Metadata, Viewport } from "next";
import { DashboardShell } from "@/components/dashboard-shell";

/** The staff app installs on its own (admin.webmanifest), opening straight on the dashboard. */
export const metadata: Metadata = {
  manifest: "/admin.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Turf Admin" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#130b09" },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
