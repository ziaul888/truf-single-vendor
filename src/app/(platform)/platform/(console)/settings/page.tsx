"use client";

import { AppearanceSettings } from "@/components/features/settings/appearance-settings";
import { PlatformBrandingSettings } from "@/components/features/platform/platform-branding-settings";
import { usePlatformMe } from "@/hooks/usePlatform";

export default function PlatformSettingsPage() {
  const { data: user } = usePlatformMe();

  return (
    <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <PlatformBrandingSettings />
      <AppearanceSettings scope="platform" id={user?.id} />
    </div>
  );
}
