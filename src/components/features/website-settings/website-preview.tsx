"use client";

import { useState } from "react";
import Image from "next/image";
import { useWatch, type Control } from "react-hook-form";
import {
  Eye, Facebook, Goal, Instagram, MessageCircle, Monitor, Phone, Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isWebsiteImageSrc, type WebsiteSettings } from "@/validations/website-settings";
import type { PublicVenue } from "@/types/settings";
import { PreviewSections } from "./preview-sections";

type Device = "desktop" | "mobile";

function isHttpsUrl(value: string | undefined) {
  if (!value) return false;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export function WebsitePreview({
  control, isDirty, venue,
}: {
  control: Control<WebsiteSettings>; isDirty: boolean; venue: PublicVenue | undefined;
}) {
  const values = useWatch({ control }) as WebsiteSettings;
  const [device, setDevice] = useState<Device>("desktop");
  if (!values?.hero || !values.sections || !venue) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <Eye className="h-4 w-4 text-muted-foreground" /> Preview
          {isDirty && <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">Unsaved</span>}
        </p>
        <DeviceToggle device={device} onChange={setDevice} />
      </div>
      <div className={cn("mx-auto overflow-hidden rounded-xl border shadow-sm transition-[max-width]", device === "mobile" ? "max-w-[300px]" : "max-w-full")}>
        <BrowserBar />
        <div className="pitch max-h-[70vh] overflow-y-auto bg-background text-foreground">
          <PreviewHeader venue={venue} mobile={device === "mobile"} />
          <PreviewHero hero={values.hero} venueName={venue.name} mobile={device === "mobile"} />
          <PreviewSections sections={values.sections} venue={venue} />
          <PreviewFooter venue={venue} social={values.social} />
        </div>
      </div>
      <p className="text-center text-[11px] text-muted-foreground">Updates as you type. Customers see changes after you save.</p>
    </div>
  );
}

function DeviceToggle({ device, onChange }: { device: Device; onChange: (d: Device) => void }) {
  const options = [
    { value: "desktop" as const, label: "Desktop", Icon: Monitor },
    { value: "mobile" as const, label: "Mobile", Icon: Smartphone },
  ];
  return (
    <div role="group" aria-label="Preview size" className="inline-flex rounded-md border p-0.5">
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={device === value}
          aria-label={label}
          onClick={() => onChange(value)}
          className={cn("rounded px-2 py-1 transition-colors", device === value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

function BrowserBar() {
  return (
    <div className="flex items-center gap-1.5 border-b bg-muted/60 px-3 py-2">
      <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
      <span className="ml-2 truncate rounded bg-background px-2 py-0.5 text-[10px] text-muted-foreground">Home page</span>
    </div>
  );
}

function PreviewHeader({ venue, mobile }: { venue: PublicVenue; mobile: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-sidebar px-3 py-2 text-sidebar-foreground">
      <div className="flex min-w-0 items-center gap-1.5">
        {venue.logoUrl ? (
          <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded bg-white">
            <Image src={venue.logoUrl} alt="" fill unoptimized sizes="24px" className="object-contain" />
          </span>
        ) : (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-accent">
            <Goal className="h-3.5 w-3.5 text-accent-foreground" />
          </span>
        )}
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[11px] font-extrabold">{venue.name || "Venue name"}</span>
          {venue.tagline && <span className="block truncate text-[8px] opacity-60">{venue.tagline}</span>}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!mobile && venue.phone && (
          <span className="flex items-center gap-1 text-[9px] opacity-80"><Phone className="h-2.5 w-2.5" />{venue.phone}</span>
        )}
        <span className="rounded bg-accent px-2 py-1 text-[9px] font-semibold text-accent-foreground">Book now</span>
      </div>
    </div>
  );
}

function PreviewHero({ hero, venueName, mobile }: { hero: WebsiteSettings["hero"]; venueName: string; mobile: boolean }) {
  return (
    <div className="relative overflow-hidden">
      {isWebsiteImageSrc(hero.imageUrl) ? (
        <Image src={hero.imageUrl} alt="" fill unoptimized sizes="420px" className="object-cover" />
      ) : (
        <div className="absolute inset-0 bg-sidebar" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-sidebar/60 to-sidebar/90" />
      <div className={cn("relative px-4 text-sidebar-foreground", mobile ? "py-8" : "py-10")}>
        {hero.badge && (
          <span className="inline-block rounded-full bg-accent px-2 py-0.5 text-[8px] font-bold tracking-wider text-accent-foreground">{hero.badge}</span>
        )}
        <p className={cn("mt-2 font-extrabold leading-tight tracking-tight", mobile ? "text-lg" : "text-2xl")}>
          {hero.headline}<br /><span className="text-accent">{venueName}</span>
        </p>
        {hero.description && <p className="mt-2 line-clamp-3 text-[10px] opacity-85">{hero.description}</p>}
        <div className="mt-3 h-7 rounded-md bg-card/90" aria-hidden />
      </div>
    </div>
  );
}

const SOCIAL_ICONS = [
  { key: "facebook", Icon: Facebook },
  { key: "instagram", Icon: Instagram },
  { key: "whatsapp", Icon: MessageCircle },
] as const;

function PreviewFooter({ venue, social }: { venue: PublicVenue; social: WebsiteSettings["social"] }) {
  const icons = SOCIAL_ICONS.filter(({ key }) => isHttpsUrl(social?.[key]));
  return (
    <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-sidebar px-3 py-3 text-[9px] text-sidebar-foreground">
      <span className="min-w-0 truncate">
        <span className="font-extrabold">{venue.name}</span>
        {venue.tagline && <span className="opacity-60"> · {venue.tagline}</span>}
      </span>
      {icons.length > 0 && (
        <span className="flex shrink-0 gap-1.5 opacity-80">
          {icons.map(({ key, Icon }) => <Icon key={key} className="h-3 w-3" />)}
        </span>
      )}
    </div>
  );
}
