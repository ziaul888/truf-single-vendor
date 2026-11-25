"use client";

import { Palette } from "lucide-react";
import { AccentColorForm } from "@/components/accent-color-form";
import { useAppearance } from "@/hooks/useAppearance";
import { appearanceEndpoint } from "@/lib/appearance-endpoint";
import { SettingsLoading, SettingsLoadError } from "./settings-load-state";
import { SettingsSection } from "./settings-section";

export function AppearanceSettings({ id }: { id?: string }) {
  const query = useAppearance(appearanceEndpoint, id);

  if (!id || !query.data) {
    if (query.isError) {
      return <SettingsLoadError what="appearance settings" onRetry={() => query.refetch()} />;
    }
    return <SettingsLoading />;
  }

  return (
    <SettingsSection
      icon={Palette}
      title="Primary color"
      description="Applied to buttons, links and navigation highlights."
    >
      <AccentColorForm key={id} endpoint={appearanceEndpoint} id={id} current={query.data} />
    </SettingsSection>
  );
}
