"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WebsiteSettingsSchema, type WebsiteSettings } from "@/validations/website-settings";
import { useMe } from "@/hooks/useMe";
import { useUpdateWebsite, useVenue, useWebsiteSettings, type WebsiteSection } from "@/hooks/useSettings";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import { SettingsPageHeader } from "@/components/features/settings/settings-page-header";
import { ReadOnlyNotice } from "@/components/features/settings/read-only-notice";
import {
  HeroFields, SocialFields, VenueSummary,
} from "@/components/features/website-settings/website-form-sections";
import {
  FeaturedGroundsEditor, HowItWorksEditor, SportChipsEditor, VisitUsEditor,
} from "@/components/features/website-settings/section-editors";
import { AmenitiesEditor } from "@/components/features/website-settings/amenities-editor";
import { WebsitePreview } from "@/components/features/website-settings/website-preview";

const FORM_ROOTS = ["hero", "sections", "social"];

/** The form holds only the editable content, not the audit fields. */
const toForm = ({ hero, sections, social }: WebsiteSection): WebsiteSettings => ({ hero, sections, social });

export default function WebsiteSettingsPage() {
  const { data, isLoading, isError, refetch } = useWebsiteSettings();
  const { data: venue } = useVenue();
  const { data: me } = useMe();
  const canEdit = me?.role === "admin";
  const save = useUpdateWebsite();
  const form = useForm<WebsiteSettings>({ resolver: zodResolver(WebsiteSettingsSchema) });
  const { reset, handleSubmit, formState: { isDirty } } = form;

  useEffect(() => { if (data) reset(toForm(data)); }, [data, reset]);

  async function onSubmit(values: WebsiteSettings) {
    try {
      reset(toForm(await save.mutateAsync(values)));
      toast.success("Website updated");
    } catch (err) {
      const failure = toApiFailure(err);
      // turf-api names nested fields with dotted paths (sections.amenities.items.2.label).
      const fields = (failure.details ?? []).map((d) => d.field).filter((f) => FORM_ROOTS.includes(f.split(".")[0]));
      if (!applyApiErrors(form, failure, {}, fields)) toast.error(failure.error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading website settings…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-3 py-10 text-sm">
        <p>Couldn&apos;t load website settings.</p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <SettingsPageHeader title="Website" description="What customers see on the booking site" audit={data}>
        <Button asChild size="sm" variant="ghost">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-4 w-4" />View site
          </Link>
        </Button>
        {canEdit && (
          <>
            <Button type="button" size="sm" variant="outline" disabled={!isDirty || save.isPending} onClick={() => reset(toForm(data))}>
              <RotateCcw className="mr-1.5 h-4 w-4" />Discard
            </Button>
            <Button type="submit" size="sm" disabled={!isDirty || save.isPending}>
              {save.isPending
                ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />Saving…</>
                : <><Save className="mr-1.5 h-4 w-4" />Save changes</>}
            </Button>
          </>
        )}
      </SettingsPageHeader>

      {me && !canEdit && <ReadOnlyNotice />}

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <fieldset disabled={!canEdit} className="min-w-0 space-y-5">
          <HeroFields form={form} />
          <VenueSummary venue={venue} />
          <h3 className="pt-2 text-sm font-semibold text-muted-foreground">Home page sections</h3>
          <SportChipsEditor form={form} />
          <FeaturedGroundsEditor form={form} />
          <AmenitiesEditor form={form} />
          <HowItWorksEditor form={form} />
          <VisitUsEditor form={form} />
          <SocialFields form={form} />
        </fieldset>
        <aside className="order-first xl:sticky xl:top-6 xl:order-none">
          <WebsitePreview control={form.control} isDirty={isDirty} venue={venue} />
        </aside>
      </div>
    </form>
  );
}
