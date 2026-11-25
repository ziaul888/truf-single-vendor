"use client";

import { Palette } from "lucide-react";
import { AccentColorForm } from "@/components/accent-color-form";
import {
  PlatformSettingsSection,
  PlatformSettingsStatus,
} from "./platform-settings-section";
import { useAppearance } from "@/hooks/useAppearance";
import { appearanceEndpoint } from "@/lib/appearance-endpoint";

export function PlatformAppearanceSettings({ id }: { id?: string }) {
  const query = useAppearance(appearanceEndpoint, id);

  return (
    <PlatformSettingsSection
      icon={Palette}
      title="Primary color"
      description="Applied to buttons, links and navigation highlights."
    >
      {id && query.data ? (
        <AccentColorForm key={id} endpoint={appearanceEndpoint} id={id} current={query.data} />
      ) : (
        <PlatformSettingsStatus
          subject="primary color"
          error={query.error}
          fetching={query.isFetching}
          onRetry={() => void query.refetch()}
        />
      )}
    </PlatformSettingsSection>
  );
}
