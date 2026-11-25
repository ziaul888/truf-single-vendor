import type { Metadata } from "next";
import { getPlatformBranding } from "@/services/tab-branding";
import { PlatformSettingsNavigation } from "./settings-navigation";

export async function generateMetadata(): Promise<Metadata> {
  const { title } = await getPlatformBranding();
  return { title: { default: "Platform settings", template: `%s · ${title}` } };
}

export default function PlatformSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Platform settings</h1>
      <PlatformSettingsNavigation />
      {children}
    </div>
  );
}
