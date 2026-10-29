import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Heart, Share2 } from "lucide-react";
import { SlotPicker } from "@/components/portal/slot-picker";
import { FormatBadge } from "@/components/portal/format-badge";
import { FORMAT_LABEL } from "@/lib/portal-stub-data";
import { getPublicGround } from "@/services/portal-grounds";
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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ground = await getPublicGround(id);
  if (!ground) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb name={ground.name} />
      <Gallery images={ground.images ?? []} />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          <Header ground={ground} />
          <About ground={ground} />
          <Specs ground={ground} />
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <SlotPicker ground={ground} />
        </aside>
      </div>
    </div>
  );
}

function Breadcrumb({ name }: { name: string }) {
  return (
    <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
      <Link href="/" className="hover:text-foreground">Home</Link>
      <ChevronRight className="h-3 w-3" />
      <Link href="/grounds" className="hover:text-foreground">Our grounds</Link>
      <ChevronRight className="h-3 w-3" />
      <span className="font-medium text-foreground">{name}</span>
    </nav>
  );
}

function Gallery({ images }: { images: string[] }) {
  const [hero, ...rest] = images;
  if (!hero) return null;
  return (
    <div className="grid h-[420px] grid-cols-1 grid-rows-2 gap-2 overflow-hidden rounded-2xl md:grid-cols-4">
      <div className="relative md:col-span-2 md:row-span-2">
        <Image src={hero} alt="" fill priority sizes="50vw" className="object-cover" />
      </div>
      {rest.slice(0, 4).map((src, i) => (
        <div key={i} className="relative hidden md:block">
          <Image src={src} alt="" fill sizes="25vw" className="object-cover" />
        </div>
      ))}
    </div>
  );
}

function Header({ ground }: { ground: Ground }) {
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
      </div>
      <div className="flex shrink-0 gap-2">
        <button className="flex h-10 w-10 items-center justify-center rounded-full border hover:bg-muted">
          <Share2 className="h-4 w-4" />
        </button>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border hover:bg-muted">
          <Heart className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const SMALL_SIDED: string[] = ["4x4", "5x5", "6x6", "7x7", "8x8", "9x9"];

function About({ ground }: { ground: Ground }) {
  // turf-api grounds carry their own description; the canned copy below is for demo grounds only.
  if (ground.description) {
    return (
      <section className="mt-8 border-b pb-8">
        <h2 className="mb-2 font-bold">About this ground</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{ground.description}</p>
      </section>
    );
  }
  if (!ground.format) return null;
  return (
    <section className="mt-8 border-b pb-8">
      <h2 className="mb-2 font-bold">About this ground</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {SMALL_SIDED.includes(ground.format)
          ? "FIFA-grade artificial turf with under-soil drainage — playable through monsoon. Full floodlight coverage for evening matches and a covered spectator area. Sits at the front of the venue, closest to parking and the locker rooms."
          : ground.format === "11x11"
          ? "Match-grade full-size pitch with dugouts on both sides and seating for 200 spectators. The surface drains in under 10 minutes after heavy rain. Booked weeks in advance during the regular season — book early."
          : ground.format === "net"
          ? "Two adjacent lanes of turf wicket with a Bola bowling machine on a track. Floodlit, covered overhead, and ventilated. Helmets and pads available on request — bring your own bat for personal feel."
          : "Indoor wooden-floor court with air conditioning and competition-grade Yonex shuttles. Rackets and shoes available for rent at reception. The most-booked weekend afternoon court — reserve at least three days ahead."}
      </p>
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
    { label: "Slot length", value: ground.slotDurationMinutes === 120 ? "2 hours" : "1 hour" },
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
