import type { Metadata, Viewport } from "next";
import { DashboardShell } from "@/components/dashboard-shell";
import { cookies } from "next/headers";
import { OwnerDashboard } from "@/components/features/owner/owner-dashboard";

/** The staff app installs on its own (admin.webmanifest), opening straight on the dashboard. */
const staffMetadata: Metadata = {
  manifest: "/admin.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Turf Admin" },
};

export async function generateMetadata(): Promise<Metadata> {
  if (!(await cookies()).get("owner_token")?.value) return staffMetadata;
  return {
    title: { absolute: "Your turf · Turf owner" },
    description: "Your turf owner account and subscription billing.",
    robots: { index: false, follow: false },
    icons: { icon: "/platform-icon.svg", apple: "/platform-icon.svg" },
    appleWebApp: { title: "Turf owner" },
    openGraph: {
      title: "Turf owner",
      siteName: "Turf owner",
      description: "Turf owner account",
      images: [],
    },
    twitter: {
      card: "summary",
      title: "Turf owner",
      description: "Turf owner account",
      images: [],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#130b09" },
  ],
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  if ((await cookies()).get("owner_token")?.value) return <OwnerDashboard />;
  return <DashboardShell>{children}</DashboardShell>;
}
