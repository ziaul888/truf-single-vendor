import type { Metadata, Viewport } from "next";
import { DashboardShell } from "@/components/dashboard-shell";
import { cookies, headers } from "next/headers";
import { tabIcons } from "@/lib/app-icons";
import { dashboardTitle } from "@/lib/dashboard-title";
import { DASHBOARD_PATH_HEADER } from "@/lib/turf-portal-path";
import { getDashboardBranding } from "@/services/tab-branding";

export async function generateMetadata(): Promise<Metadata> {
  const [requestHeaders, { venue, isOwner }] = await Promise.all([headers(), getDashboardBranding()]);
  const title = dashboardTitle(requestHeaders.get(DASHBOARD_PATH_HEADER) ?? "");
  return {
    title: `${title} · ${venue.name}`,
    icons: tabIcons(isOwner ? "owner" : undefined),
    manifest: "/admin.webmanifest",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: `${venue.name} Admin` },
  };
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
