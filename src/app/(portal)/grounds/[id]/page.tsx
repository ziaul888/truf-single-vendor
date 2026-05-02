import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Heart, Share2, Star } from "lucide-react";
import { SlotPicker } from "@/components/portal/slot-picker";
import { FormatBadge } from "@/components/portal/format-badge";
import { findGround, FORMAT_LABEL } from "@/lib/portal-stub-data";
import type { Ground } from "@/types/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const ground = findGround(id);
  return {
    title: ground ? `${ground.name} · ${FORMAT_LABEL[ground.format]}` : "Ground",
  };
}

export default async function GroundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ground = findGround(id);
  if (!ground) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumb name={ground.name} />
      <Gallery images={ground.images} />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
        <div>
          <Header ground={ground} />
          <About ground={ground} />
          <Specs ground={ground} />
          <Reviews ground={ground} />
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
          <FormatBadge format={ground.format} size="md" />
          <span className="text-xs capitalize text-muted-foreground">
            {ground.sport} · {ground.surface.replace("-", " ")}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{ground.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ground.dimensions ? `${ground.dimensions} · ` : ""}
          {ground.amenities.slice(0, 3).join(" · ")}
        </p>
        {ground.rating != null && (
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1 font-semibold">
              <Star className="h-4 w-4 fill-accent text-accent" /> {ground.rating}
            </span>
            <span className="text-muted-foreground">{ground.reviewCount} bookings this month</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-muted-foreground">
              Open today {pad(ground.openHour)}:00 — {pad(ground.closeHour)}:00
            </span>
          </div>
        )}
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

function About({ ground }: { ground: Ground }) {
  return (
    <section className="mt-8 border-b pb-8">
      <h2 className="mb-2 font-bold">About this ground</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {ground.format === "5x5" || ground.format === "6x6" || ground.format === "7x7"
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
  const items = [
    { label: "Format", value: FORMAT_LABEL[ground.format] },
    { label: "Dimensions", value: ground.dimensions ?? "—" },
    { label: "Surface", value: ground.surface.replace("-", " ") },
    { label: "Capacity", value: `${ground.capacity} players` },
    { label: "Lighting", value: ground.amenities.find((a) => /light/i.test(a)) ?? "Daylight" },
    { label: "Open hours", value: `${pad(ground.openHour)}:00–${pad(ground.closeHour)}:00` },
    { label: "Slot length", value: "1 hour" },
    { label: "Sport", value: ground.sport },
  ];
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

function Reviews({ ground }: { ground: Ground }) {
  const reviews = [
    { initials: "RH", name: "Rakib H.", rating: 5.0, when: "2 days ago",
      text: "Pitch quality is top-notch. The lights and the locker room make late-night games actually enjoyable." },
    { initials: "SA", name: "Sadia A.", rating: 4.5, when: "1 week ago",
      text: "Booking was instant, confirmation arrived in seconds. Parking gets tight on Friday evenings — book early." },
  ];
  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">Reviews</h2>
        <Link href="#" className="text-sm font-medium hover:text-primary">
          See all {ground.reviewCount ?? 0} →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reviews.map((r) => (
          <article key={r.initials} className="rounded-xl border p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar text-xs font-bold text-sidebar-foreground">
                {r.initials}
              </div>
              <div>
                <p className="text-sm font-semibold">{r.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-accent text-accent" /> {r.rating} · {r.when}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{r.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const pad = (n: number) => n.toString().padStart(2, "0");
