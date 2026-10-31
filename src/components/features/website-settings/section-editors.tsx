"use client";

import type { UseFormReturn } from "react-hook-form";
import { Footprints, LayoutGrid, MapPinned, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_WEBSITE_SETTINGS } from "@/lib/website-defaults";
import type { WebsiteSettings } from "@/validations/website-settings";
import { FormField } from "./form-primitives";
import { SectionCard } from "./section-card";
import { ImageUploadField } from "./image-upload-field";

type Form = UseFormReturn<WebsiteSettings>;

export function SportChipsEditor({ form }: { form: Form }) {
  const e = form.formState.errors.sections?.sportChips;
  return (
    <SectionCard form={form} sectionKey="sportChips" title="Browse by sport" icon={Trophy} description="Shortcuts to football, cricket and badminton grounds.">
      <FormField id="sport-title" label="Title" error={e?.title?.message}>
        <Input id="sport-title" {...form.register("sections.sportChips.title")} />
      </FormField>
    </SectionCard>
  );
}

export function FeaturedGroundsEditor({ form }: { form: Form }) {
  const e = form.formState.errors.sections?.featuredGrounds;
  return (
    <SectionCard form={form} sectionKey="featuredGrounds" title="Our grounds" icon={LayoutGrid} description="Cards for every ground. Ground details come from the Grounds page.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="grounds-title" label="Title" error={e?.title?.message}>
          <Input id="grounds-title" {...form.register("sections.featuredGrounds.title")} />
        </FormField>
        <FormField id="grounds-subtitle" label="Subtitle" error={e?.subtitle?.message}>
          <Input id="grounds-subtitle" {...form.register("sections.featuredGrounds.subtitle")} />
        </FormField>
      </div>
    </SectionCard>
  );
}

export function HowItWorksEditor({ form }: { form: Form }) {
  const e = form.formState.errors.sections?.howItWorks;
  return (
    <SectionCard form={form} sectionKey="howItWorks" title="How it works" icon={Footprints} description="Three numbered steps and a button to the grounds list.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField id="how-badge" label="Badge" hint="Leave empty to hide it." error={e?.badge?.message}>
          <Input id="how-badge" {...form.register("sections.howItWorks.badge")} />
        </FormField>
        <FormField id="how-title" label="Title" error={e?.title?.message}>
          <Input id="how-title" {...form.register("sections.howItWorks.title")} />
        </FormField>
        <FormField id="how-button" label="Button text" error={e?.buttonLabel?.message}>
          <Input id="how-button" {...form.register("sections.howItWorks.buttonLabel")} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 rounded-lg border p-3">
            <p className="text-xs font-semibold text-muted-foreground">Step {i + 1}</p>
            <FormField id={`how-step-${i}-title`} label="Title" error={e?.steps?.[i]?.title?.message}>
              <Input id={`how-step-${i}-title`} {...form.register(`sections.howItWorks.steps.${i}.title`)} />
            </FormField>
            <FormField id={`how-step-${i}-body`} label="Text" error={e?.steps?.[i]?.body?.message}>
              <Textarea id={`how-step-${i}-body`} rows={3} {...form.register(`sections.howItWorks.steps.${i}.body`)} />
            </FormField>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function VisitUsEditor({ form }: { form: Form }) {
  const e = form.formState.errors.sections?.visitUs;
  return (
    <SectionCard form={form} sectionKey="visitUs" title="Visit us" icon={MapPinned} description="Address, hours and contact come from Venue & contact above.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="visit-badge" label="Badge" hint="Leave empty to hide it." error={e?.badge?.message}>
          <Input id="visit-badge" {...form.register("sections.visitUs.badge")} />
        </FormField>
        <FormField id="visit-title" label="Title" error={e?.title?.message}>
          <Input id="visit-title" {...form.register("sections.visitUs.title")} />
        </FormField>
      </div>
      <ImageUploadField
        form={form}
        name="sections.visitUs.imageUrl"
        slot="visit"
        label="Venue photo"
        hint="Shown next to the address. Links to Google Maps when a map link is set."
        defaultUrl={DEFAULT_WEBSITE_SETTINGS.sections.visitUs.imageUrl}
      />
    </SectionCard>
  );
}
