import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, MapPin } from "lucide-react";
import { SlotPicker } from "@/components/portal/slot-picker";
import { ShareButton } from "@/components/portal/share-button";
import { FormatBadge } from "@/components/portal/format-badge";
import { FORMAT_LABEL } from "@/lib/portal-stub-data";
import { getPublicGround, listPublicGrounds } from "@/services/portal-grounds";
import { getPublicVenue } from "@/services/website-settings";
import { GroundLocation } from "@/components/portal/ground-location";
import { GroundRules } from "@/components/portal/ground-rules";
import { directionsUrl } from "@/lib/maps";
import { durationLabel } from "@/lib/slot-format";
import type { Ground } from "@/types/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ground = await getPublicGround(id).catch(() => null);
  if (!ground) return { title: "Ground" };
  return {
    title: ground.format ? `${ground.name} · ${FORMAT_LABEL[ground.format]}` : ground.name,
    description: ground.description ?? undefined,
  };
}

export default async function GroundDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string | string[] }>;
}) {
  const [{ id }, { date }] = await Promise.all([params, searchParams]);
  const [ground, venue, grounds] = await Promise.all([getPublicGround(id), getPublicVenue(), listPublicGrounds()]);
  if (!ground) notFound();
  // The ground's own address (set in the dashboard), else the venue's.
  const location = ground.address?.trim() || venue.address.trim();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb name={ground.name} single={grounds.length === 1} />
      <Gallery images={ground.images ?? []} />

      {/* Phones: header, then the picker, then the details. From lg the picker sits in its own column beside both. */}
      <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-[1fr_400px] lg:grid-rows-[auto_1fr] lg:gap-y-0">
        <div className="lg:col-start-1 lg:row-start-1">
          <Header ground={ground} location={location} />
        </div>

        <aside className="lg:sticky lg:top-20 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <SlotPicker ground={ground} initialDate={typeof date === "string" ? date : undefined} />
        </aside>

        <div className="lg:col-start-1 lg:row-start-2">
          <About ground={ground} />
          <GroundRules rules={ground.rules} className="mt-6 border-b pb-8" />
          <Specs ground={ground} />
          <GroundLocation groundAddress={ground.address} venueAddress={venue.address} />
        </div>
      </div>
    </div>
  );
}

/** With a single ground, "Our grounds" would only lead back here, so it is left out. */
function Breadcrumb({ name, single }: { name: string; single: boolean }) {
  return (
    <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
      <Link href="/" className="hover:text-foreground">Home</Link>
      <ChevronRight className="h-3 w-3" />
      {!single && (
        <>
          <Link href="/grounds" className="hover:text-foreground">Our grounds</Link>
          <ChevronRight className="h-3 w-3" />
        </>
      )}
      <span className="font-medium text-foreground">{name}</span>
    </nav>
  );
}

function Gallery({ images }: { images: string[] }) {
  const [hero, ...rest] = images;
  if (!hero) return null;
  return (
    <div className="grid h-56 grid-cols-1 grid-rows-1 gap-2 overflow-hidden rounded-2xl sm:h-72 md:h-[420px] md:grid-cols-4 md:grid-rows-2">
      <div className="relative md:col-span-2 md:row-span-2">
        <Image src={hero} alt="" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
      </div>
      {rest.slice(0, 4).map((src, i) => (
        <div key={i} className="relative hidden md:block">
          <Image src={src} alt="" fill sizes="25vw" className="object-cover" />
        </div>
      ))}
    </div>
  );
}

function Header({ ground, location }: { ground: Ground; location: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-2">
          {ground.format && <FormatBadge format={ground.format} size="md" />}
          <span className="text-xs capitalize text-muted-foreground">
            {[ground.sport, ground.surface?.replace("-", " ")].filter(Boolean).join(" · ")}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{ground.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ground.dimensions ? `${ground.dimensions} · ` : ""}
          {ground.amenities?.length ? ground.amenities.slice(0, 3).join(" · ") : ground.address}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Open {pad(ground.openHour)}:00 — {pad(ground.closeHour)}:00
        </p>
        {location && (
          <a href={directionsUrl(location)} target="_blank" rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="underline decoration-dotted underline-offset-2">{location}</span>
          </a>
        )}
      </div>
      <ShareButton title={ground.name} className="shrink-0" />
    </div>
  );
}

function About({ ground }: { ground: Ground }) {
  if (!ground.description) return null;
  return (
    <section className="mt-8 border-b pb-8">
      <h2 className="mb-2 font-bold">About this ground</h2>
      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{ground.description}</p>
    </section>
  );
}

function Specs({ ground }: { ground: Ground }) {
  // Only specs the ground actually has; turf-api v1 provides hours (and the fixed 1-hour slots).
  const items = [
    { label: "Format", value: ground.format && FORMAT_LABEL[ground.format] },
    { label: "Dimensions", value: ground.dimensions },
    { label: "Surface", value: ground.surface?.replace("-", " ") },
    { label: "Capacity", value: ground.capacity != null ? `${ground.capacity} players` : undefined },
    { label: "Lighting", value: ground.amenities?.find((a) => /light/i.test(a)) },
    { label: "Open hours", value: `${pad(ground.openHour)}:00–${pad(ground.closeHour)}:00` },
    { label: "Slot length", value: durationLabel(ground.slotDurationMinutes ?? 60) },
    { label: "Sport", value: ground.sport },
  ].filter((it): it is { label: string; value: string } => !!it.value);
  return (
    <section className="mt-6 border-b pb-8">
      <h2 className="mb-3 font-bold">Specifications</h2>
      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        {items.map((it) => (
          <div key={it.label} className="rounded-lg bg-muted/40 p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {it.label}
            </p>
            <p className="mt-0.5 font-bold capitalize">{it.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const pad = (n: number) => n.toString().padStart(2, "0");
