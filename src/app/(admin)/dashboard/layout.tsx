import type { Metadata, Viewport } from "next";
import { DashboardShell } from "@/components/dashboard-shell";
import { cookies } from "next/headers";

/** The staff app installs on its own (admin.webmanifest), opening straight on the dashboard. */
const staffMetadata: Metadata = {
  manifest: "/admin.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Turf Admin" },
};

export async function generateMetadata(): Promise<Metadata> {
  return staffMetadata;
}

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#130b09" },
  ],
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const audience = (await cookies()).get("owner_token")?.value ? "owner" : "staff";
  return <DashboardShell audience={audience}>{children}</DashboardShell>;
}
