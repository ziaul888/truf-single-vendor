import Image from "next/image";
import { Calendar, MapPin, Navigation, Phone, ShieldCheck } from "lucide-react";
import type { WebsiteSections } from "@/validations/website-settings";
import type { PublicVenue } from "@/types/settings";
import { HomeSection } from "./home-section";
import { isUploadedImage } from "./is-uploaded-image";

export function VisitUsSection({
  content, venue,
}: {
  content: WebsiteSections["visitUs"]; venue: PublicVenue;
}) {
  return (
    <HomeSection id="visit">
      <div className="grid overflow-hidden rounded-3xl border bg-card md:grid-cols-2">
        <div className="relative h-52 md:h-auto md:min-h-96">
          <Image
            src={content.imageUrl}
            alt="The venue"
            fill
            unoptimized={isUploadedImage(content.imageUrl)}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="p-5 sm:p-8">
          {content.badge && (
            <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-wider text-accent-foreground">
              {content.badge}
            </span>
          )}
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-4xl">{content.title}</h2>
          <ContactDetails venue={venue} />
          <Actions venue={venue} />
        </div>
      </div>
    </HomeSection>
  );
}

function ContactDetails({ venue }: { venue: PublicVenue }) {
  // Only what the admin has entered on Settings → General.
  const reception = [venue.phone, venue.email].filter(Boolean).join(" · ");
  return (
    <dl className="mt-4 space-y-3 text-sm sm:mt-6 sm:space-y-4">
      {venue.address && <Detail Icon={MapPin} label="Address">{venue.address}</Detail>}
      {venue.openHours && <Detail Icon={Calendar} label="Open hours">Every day · {venue.openHours}</Detail>}
      {reception && <Detail Icon={ShieldCheck} label="Reception">{reception}</Detail>}
    </dl>
  );
}

/** The two things a visitor does with this section, as big tap targets. */
function Actions({ venue }: { venue: PublicVenue }) {
  if (!venue.mapUrl && !venue.phone) return null;
  return (
    <div className="mt-5 flex flex-col gap-2 sm:mt-6 sm:flex-row">
      {venue.mapUrl && (
        <a
          href={venue.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Navigation className="h-4 w-4" /> Get directions
        </a>
      )}
      {venue.phone && (
        <a
          href={`tel:${venue.phone.replace(/[^\d+]/g, "")}`}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-6 text-sm font-semibold hover:bg-muted"
        >
          <Phone className="h-4 w-4" /> Call
        </a>
      )}
    </div>
  );
}

function Detail({
  Icon, label, children,
}: {
  Icon: typeof MapPin; label: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="font-semibold">{label}</dt>
        <dd className="text-muted-foreground">{children}</dd>
      </div>
    </div>
  );
}
