import Image from "next/image";
import { Calendar, MapPin, ShieldCheck } from "lucide-react";
import type { WebsiteSections, WebsiteSettings } from "@/validations/website-settings";
import { isUploadedImage } from "./is-uploaded-image";

export function VisitUsSection({
  content, contact,
}: {
  content: WebsiteSections["visitUs"]; contact: WebsiteSettings["contact"];
}) {
  return (
    <section id="visit" className="bg-card py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        <div>
          {content.badge && (
            <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-wider text-accent-foreground">
              {content.badge}
            </span>
          )}
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{content.title}</h2>
          <ContactDetails contact={contact} />
        </div>
        <VenueImage src={content.imageUrl} mapUrl={contact.mapUrl} />
      </div>
    </section>
  );
}

function ContactDetails({ contact }: { contact: WebsiteSettings["contact"] }) {
  return (
    <dl className="mt-6 space-y-4 text-sm">
      <Detail Icon={MapPin} label="Address">
        {contact.address}
        {contact.mapUrl && (
          <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-xs text-primary underline">
            Get directions →
          </a>
        )}
      </Detail>
      <Detail Icon={Calendar} label="Open hours">Every day · {contact.openHours}</Detail>
      <Detail Icon={ShieldCheck} label="Reception">
        {contact.phone} · {contact.email}
      </Detail>
    </dl>
  );
}

function VenueImage({ src, mapUrl }: { src: string; mapUrl: string }) {
  const image = (
    <div className="relative h-72 overflow-hidden rounded-2xl border">
      <Image
        src={src}
        alt="The venue"
        fill
        unoptimized={isUploadedImage(src)}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-sidebar/20" />
      {mapUrl && (
        <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-lg bg-card p-3 text-sm">
          <MapPin className="h-5 w-5 text-primary" />
          <span className="font-medium">Open in Google Maps</span>
        </div>
      )}
    </div>
  );
  return mapUrl ? <a href={mapUrl} target="_blank" rel="noopener noreferrer">{image}</a> : image;
}

function Detail({
  Icon, label, children,
}: {
  Icon: typeof MapPin; label: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 text-primary" />
      <div>
        <dt className="font-semibold">{label}</dt>
        <dd className="text-muted-foreground">{children}</dd>
      </div>
    </div>
  );
}
