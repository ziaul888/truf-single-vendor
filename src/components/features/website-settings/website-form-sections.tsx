"use client";

import type { UseFormReturn } from "react-hook-form";
import { Image as ImageIcon, MapPin, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_WEBSITE_SETTINGS } from "@/services/website-settings";
import type { WebsiteSettings } from "@/validations/website-settings";
import { FormField, SettingsSection } from "./form-primitives";
import { ImageUploadField } from "./image-upload-field";

type Form = UseFormReturn<WebsiteSettings>;

export function HeroFields({ form }: { form: Form }) {
  const { register, formState: { errors } } = form;
  const e = errors.hero;
  return (
    <SettingsSection title="Hero" icon={ImageIcon} description="The first thing visitors see on the home page.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="hero-badge" label="Badge" hint="Small label above the headline. Leave empty to hide it." error={e?.badge?.message}>
          <Input id="hero-badge" {...register("hero.badge")} />
        </FormField>
        <FormField id="hero-headline" label="Headline" hint="Shown before the venue name, e.g. “Welcome to”." error={e?.headline?.message}>
          <Input id="hero-headline" {...register("hero.headline")} />
        </FormField>
      </div>
      <FormField id="hero-description" label="Description" error={e?.description?.message}>
        <Textarea id="hero-description" rows={3} {...register("hero.description")} />
      </FormField>
      <ImageUploadField
        form={form}
        name="hero.imageUrl"
        slot="hero"
        label="Background image"
        hint="JPG, PNG or WebP. Wide photos work best. Large images are resized to 1920px."
        defaultUrl={DEFAULT_WEBSITE_SETTINGS.hero.imageUrl}
      />
    </SettingsSection>
  );
}

export function ContactFields({ form }: { form: Form }) {
  const { register, formState: { errors } } = form;
  const e = errors.contact;
  return (
    <SettingsSection title="Venue & contact" icon={MapPin} description="Used in the header, the Visit us section and the footer.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="contact-name" label="Venue name" error={e?.venueName?.message}>
          <Input id="contact-name" {...register("contact.venueName")} />
        </FormField>
        <FormField id="contact-tagline" label="Location tagline" hint="Shown under the name in the header." error={e?.tagline?.message}>
          <Input id="contact-tagline" {...register("contact.tagline")} />
        </FormField>
        <FormField id="contact-phone" label="Phone" error={e?.phone?.message}>
          <Input id="contact-phone" type="tel" {...register("contact.phone")} />
        </FormField>
        <FormField id="contact-email" label="Email" error={e?.email?.message}>
          <Input id="contact-email" type="email" {...register("contact.email")} />
        </FormField>
        <FormField id="contact-hours" label="Opening hours" error={e?.openHours?.message}>
          <Input id="contact-hours" {...register("contact.openHours")} />
        </FormField>
        <FormField id="contact-map" label="Google Maps link" hint="Powers the “Get directions” link." error={e?.mapUrl?.message}>
          <Input id="contact-map" type="url" placeholder="https://maps.app.goo.gl/…" {...register("contact.mapUrl")} />
        </FormField>
      </div>
      <FormField id="contact-address" label="Address" error={e?.address?.message}>
        <Input id="contact-address" {...register("contact.address")} />
      </FormField>
    </SettingsSection>
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
