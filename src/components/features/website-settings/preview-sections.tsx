"use client";

import Image from "next/image";
import { Calendar, MapPin, Phone } from "lucide-react";
import { AMENITY_ICONS } from "@/components/portal/amenity-icons";
import {
  isWebsiteImageSrc, type WebsiteSectionKey, type WebsiteSections,
} from "@/validations/website-settings";
import type { PublicVenue } from "@/types/settings";

const SECTION_COUNT = 5;

/** Compact, read-only rendering of the home page sections for the live preview. */
export function PreviewSections({ sections, venue }: { sections: WebsiteSections; venue: PublicVenue }) {
  const hiddenCount = (Object.keys(sections) as WebsiteSectionKey[]).filter((k) => !sections[k]?.enabled).length;
  return (
    <div className="space-y-px bg-white/5">
      {sections.sportChips?.enabled && <PreviewSportChips content={sections.sportChips} />}
      {sections.featuredGrounds?.enabled && <PreviewGrounds content={sections.featuredGrounds} />}
      {sections.amenities?.enabled && <PreviewAmenities content={sections.amenities} />}
      {sections.howItWorks?.enabled && <PreviewHowItWorks content={sections.howItWorks} />}
      {sections.visitUs?.enabled && <PreviewVisit content={sections.visitUs} venue={venue} />}
      {hiddenCount > 0 && (
        <p className="bg-card py-2 text-center text-[9px] text-muted-foreground">
          {hiddenCount} of {SECTION_COUNT} sections hidden
        </p>
      )}
    </div>
  );
}

function Bars() {
  return (
    <div className="mt-1.5 flex gap-1" aria-hidden>
      <span className="h-3 w-12 rounded-full bg-muted" /><span className="h-3 w-10 rounded-full bg-muted" /><span className="h-3 w-14 rounded-full bg-muted" />
    </div>
  );
}

function PreviewSportChips({ content }: { content: WebsiteSections["sportChips"] }) {
  return (
    <div className="bg-card px-3 py-3">
      <p className="text-[10px] font-bold">{content.title}</p>
      <Bars />
    </div>
  );
}

function PreviewGrounds({ content }: { content: WebsiteSections["featuredGrounds"] }) {
  return (
    <div className="bg-muted/30 px-3 py-3">
      <p className="text-[11px] font-bold">{content.title}</p>
      {content.subtitle && <p className="text-[8px] text-muted-foreground">{content.subtitle}</p>}
      <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => <span key={i} className="aspect-4/3 rounded bg-muted" />)}
      </div>
    </div>
  );
}

function PreviewAmenities({ content }: { content: WebsiteSections["amenities"] }) {
  return (
    <div className="bg-card px-3 py-3 text-center">
      <p className="text-[11px] font-bold">{content.title}</p>
      {content.subtitle && <p className="text-[8px] text-muted-foreground">{content.subtitle}</p>}
      <div className="mt-2 flex flex-wrap justify-center gap-x-2 gap-y-2">
        {(content.items ?? []).map((item, i) => {
          const Icon = item?.icon ? AMENITY_ICONS[item.icon]?.Icon : undefined;
          return (
            <div key={i} className="w-[calc(33.333%-0.375rem)] min-w-0">
              {Icon && <Icon className="mx-auto h-3.5 w-3.5 text-primary" />}
              <p className="mt-0.5 truncate text-[8px]">{item?.label || "—"}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PreviewHowItWorks({ content }: { content: WebsiteSections["howItWorks"] }) {
  return (
    <div className="bg-sidebar px-3 py-4 text-center text-sidebar-foreground">
      {content.badge && <span className="rounded-full bg-accent px-2 py-0.5 text-[7px] font-bold text-accent-foreground">{content.badge}</span>}
      <p className="mt-1.5 text-[11px] font-extrabold">{content.title}</p>
      <div className="mt-2 grid grid-cols-3 gap-2 text-left">
        {(content.steps ?? []).map((step, i) => (
          <div key={i} className="min-w-0">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-accent-foreground">{i + 1}</span>
            <p className="mt-1 truncate text-[8px] font-bold">{step?.title}</p>
            <p className="line-clamp-2 text-[7px] opacity-70">{step?.body}</p>
          </div>
        ))}
      </div>
      <span className="mt-2 inline-block rounded bg-accent px-2 py-1 text-[8px] font-bold text-accent-foreground">{content.buttonLabel} →</span>
    </div>
  );
}

function PreviewVisit({ content, venue }: { content: WebsiteSections["visitUs"]; venue: PublicVenue }) {
  return (
    <div className="grid grid-cols-2 gap-2 bg-card px-3 py-3 text-[8px]">
      <div className="min-w-0 space-y-1">
        {content.badge && <span className="rounded-full bg-accent px-2 py-0.5 text-[7px] font-bold text-accent-foreground">{content.badge}</span>}
        <p className="text-[10px] font-extrabold leading-tight">{content.title}</p>
        <p className="flex gap-1"><MapPin className="h-2.5 w-2.5 shrink-0 text-primary" /><span className="wrap-break-word">{venue.address}</span></p>
        <p className="flex gap-1"><Calendar className="h-2.5 w-2.5 shrink-0 text-primary" />{venue.openHours}</p>
        <p className="flex gap-1"><Phone className="h-2.5 w-2.5 shrink-0 text-primary" /><span className="break-all">{venue.phone}</span></p>
      </div>
      <div className="relative min-h-20 overflow-hidden rounded border">
        {isWebsiteImageSrc(content.imageUrl)
          ? <Image src={content.imageUrl} alt="" fill unoptimized sizes="180px" className="object-cover" />
          : <div className="absolute inset-0 bg-muted" />}
      </div>
    </div>
  );
}
