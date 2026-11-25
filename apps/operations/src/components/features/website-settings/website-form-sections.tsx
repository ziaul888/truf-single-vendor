"use client";

import Link from "next/link";
import type { UseFormReturn } from "react-hook-form";
import { Image as ImageIcon, MapPin, Pencil, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_WEBSITE_SETTINGS } from "@/lib/website-defaults";
import type { WebsiteSettings } from "@/validations/website-settings";
import type { PublicVenue } from "@/types/settings";
import { FormField, SettingsSection } from "./form-primitives";
import { ImageUploadField } from "./image-upload-field";

type Form = UseFormReturn<WebsiteSettings>;

export function HeroFields({ form }: { form: Form }) {
  const { register, formState: { errors } } = form;
  const e = errors.hero;
  return (
    <SettingsSection title="Hero" icon={ImageIcon} description="The first thing visitors see on the home page.">
      <FormField id="hero-headline" label="Page title" hint="Read by screen readers and search engines, not shown on the page. The hero shows the photo and the search box." error={e?.headline?.message}>
        <Input id="hero-headline" {...register("hero.headline")} />
      </FormField>
      <ImageUploadField
        form={form}
        name="hero.imageUrl"
        slot="hero"
        label="Background image"
        hint="JPG, PNG or WebP. Wide photos work best. Large images are resized to 1920px."
        defaultUrl={DEFAULT_WEBSITE_SETTINGS.hero.imageUrl}
      />
      <FormField
        id="hero-video"
        label="Background video link (optional)"
        hint="A short loop under 10 seconds and under 5 MB, as a direct .mp4 or .webm link. YouTube links don't work. The photo shows until the video loads, and for visitors who turned on Reduce motion or Data Saver."
        error={e?.videoUrl?.message}
      >
        <Input id="hero-video" type="url" inputMode="url" placeholder="https://…/loop.mp4" {...register("hero.videoUrl")} />
      </FormField>
    </SettingsSection>
  );
}

/** Venue details now live in the venue profile (General); the website shows them read-only. */
export function VenueSummary({ venue }: { venue: PublicVenue | undefined }) {
  return (
    <SettingsSection title="Venue & contact" icon={MapPin} description="Used in the header, the Visit us section and the footer.">
      {venue ? (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <SummaryRow label="Venue name" value={venue.name} />
          <SummaryRow label="Tagline" value={venue.tagline} />
          <SummaryRow label="Phone" value={venue.phone} />
          <SummaryRow label="Email" value={venue.email} />
          <SummaryRow label="Opening hours" value={venue.openHours} />
          <SummaryRow label="Address" value={venue.address} />
        </dl>
      ) : (
        <div className="h-20 animate-pulse rounded bg-muted" />
      )}
      <Button asChild size="sm" variant="outline">
        <Link href="/dashboard/settings/general"><Pencil className="mr-1.5 h-4 w-4" />Edit on General</Link>
      </Button>
    </SettingsSection>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate">{value || <span className="text-muted-foreground">Not set</span>}</dd>
    </div>
  );
}

export function SocialFields({ form }: { form: Form }) {
  const { register, formState: { errors } } = form;
  const e = errors.social;
  return (
    <SettingsSection title="Social links" icon={Share2} description="Shown in the footer. Leave a field empty to hide that link.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField id="social-facebook" label="Facebook" error={e?.facebook?.message}>
          <Input id="social-facebook" type="url" placeholder="https://facebook.com/…" {...register("social.facebook")} />
        </FormField>
        <FormField id="social-instagram" label="Instagram" error={e?.instagram?.message}>
          <Input id="social-instagram" type="url" placeholder="https://instagram.com/…" {...register("social.instagram")} />
        </FormField>
        <FormField id="social-whatsapp" label="WhatsApp" error={e?.whatsapp?.message}>
          <Input id="social-whatsapp" type="url" placeholder="https://wa.me/8801…" {...register("social.whatsapp")} />
        </FormField>
      </div>
    </SettingsSection>
  );
}
