"use client";

import { Building2, Globe, Image as ImageIcon, Info } from "lucide-react";
import { useVenue } from "@/hooks/useSettings";
import { useMe } from "@/hooks/useMe";
import { useVenueForm } from "@/hooks/useVenueForm";
import { SettingsPageHeader } from "@/components/features/settings/settings-page-header";
import { SettingsSection } from "@/components/features/settings/settings-section";
import { ReadOnlyNotice } from "@/components/features/settings/read-only-notice";
import { SettingsLoadError, SettingsLoading } from "@/components/features/settings/settings-load-state";
import { SettingsSaveActions } from "@/components/features/settings/settings-save-actions";
import { VenueFields } from "@/components/features/settings/venue-fields";
import { VenueLogoField } from "@/components/features/settings/venue-logo-field";
import { VenueLocale } from "@/components/features/settings/venue-locale";

// The one venue profile. The booking website and every email read it (the Website page has no contact block).
export default function GeneralSettingsPage() {
  const { data: venue, isLoading, isError, refetch } = useVenue();
  const { data: me } = useMe();
  const canEdit = me?.role === "admin";
  const { form, submit, discard, saving } = useVenueForm(venue);

  if (isLoading) return <SettingsLoading />;
  if (isError || !venue) return <SettingsLoadError what="venue details" onRetry={() => refetch()} />;

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <SettingsPageHeader title="General" description="Venue details, logo and locale" audit={venue}>
        {canEdit && <SettingsSaveActions dirty={form.formState.isDirty} saving={saving} onDiscard={discard} />}
      </SettingsPageHeader>
      {!canEdit && <ReadOnlyNotice />}

      <p className="flex items-start gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        These details show on the booking website and in every email to customers. Venue contact details live
        here now; the Website page no longer has its own contact block.
      </p>

      <fieldset disabled={!canEdit || saving} className="space-y-5">
        <SettingsSection title="Venue profile" icon={Building2} description="Name, contact details and address">
          <VenueFields form={form} />
        </SettingsSection>
      </fieldset>

      <SettingsSection title="Logo" icon={ImageIcon} description="Shown in the website header and in emails">
        <VenueLogoField logoUrl={venue.logoUrl} name={venue.name} canEdit={canEdit} />
      </SettingsSection>

      <SettingsSection title="Locale" icon={Globe} description="Fixed for v1. Prices and times everywhere use these.">
        <VenueLocale locale={venue.locale} />
      </SettingsSection>
    </form>
  );
}
