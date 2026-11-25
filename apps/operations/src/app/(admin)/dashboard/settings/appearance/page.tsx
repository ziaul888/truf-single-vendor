"use client";

import { AppearanceSettings } from "@/components/features/settings/appearance-settings";
import { SettingsPageHeader } from "@/components/features/settings/settings-page-header";
import { useDashboardAudience } from "@/components/dashboard-audience";
import { useMe } from "@/hooks/useMe";

export default function TurfAppearancePage() {
  const { data: user } = useMe(useDashboardAudience());
  const owner = user?.role === "owner" ? user : undefined;

  return (
    <div className="max-w-2xl space-y-5">
      <SettingsPageHeader
        title="Appearance"
        description="Choose the primary color for your turf dashboard."
      />
      {owner ? (
        <AppearanceSettings scope="turf" id={owner.tenant.id} />
      ) : (
        <p className="text-muted-foreground text-sm">The turf owner manages dashboard colors.</p>
      )}
    </div>
  );
}
