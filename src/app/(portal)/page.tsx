import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, BadgeCheck, Calendar, Car, CircleDot, Coffee, Droplets,
  Grid3x3, Heart, Lock, MapPin, Search, ShieldCheck, Star, Wifi, Zap, Goal,
} from "lucide-react";
import { GroundCard } from "@/components/portal/ground-card";
import { GROUNDS, SPORT_COUNTS, VENUE } from "@/lib/portal-stub-data";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <SportChips />
      <FeaturedGrounds />
      <VenueAmenities />
      <HowItWorks />
      <VisitUs />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1920"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Pitch-themed gradient overlay so text stays legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-sidebar/60 to-sidebar/90" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-2xl text-sidebar-foreground">
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-wider text-accent-foreground">
            BOOK IN 60 SECONDS
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Welcome to<br />
            <span className="text-accent">{VENUE.name}</span>
          </h1>
          <p className="mt-4 max-w-xl text-base opacity-85 sm:text-lg">
            Six fields under one roof — football 5×5 / 6×6 / 7×7, full-size cricket nets and indoor badminton courts. Real-time slot availability, instant confirmation.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm opacity-90">
            <Stat n="6" label="grounds" />
            <Stat n="3" label="sports" />
            <Stat n="06–23" label="daily hours" />
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <Stat n={String(VENUE.rating)} label={`${VENUE.reviewCount} reviews`} />
            </span>
          </div>
        </div>

        {/* Search box */}
        <SearchBox />

        <div className="relative mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-sidebar-foreground/80">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" /> Secure Stripe payments
          </span>
          <span className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-accent" /> Money-back on cancellation
          </span>
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent" /> Instant email confirmation
          </span>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <span>
      <span className="text-2xl font-extrabold tracking-tight text-accent">{n}</span>{" "}
      <span className="text-sm">{label}</span>
    </span>
  );
}

function SearchBox() {
  return (
    <form
      action="/grounds"
      className="relative mt-10 max-w-3xl rounded-2xl bg-card/95 p-3 shadow-2xl backdrop-blur sm:p-4"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:gap-3">
        <Field colSpan={4} icon={Calendar} label="Date">
          <input
            type="date"
            name="date"
            className="w-full bg-transparent text-sm font-medium outline-none"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </Field>
        <Field colSpan={3} icon={CircleDot} label="Sport">
          <select name="sport" className="w-full bg-transparent text-sm font-medium outline-none">
            <option value="">Any sport</option>
            <option value="football">Football</option>
            <option value="cricket">Cricket</option>
            <option value="badminton">Badminton</option>
          </select>
        </Field>
        <Field colSpan={3} icon={Grid3x3} label="Format">
          <select name="format" className="w-full bg-transparent text-sm font-medium outline-none">
            <option value="">Any size</option>
            <option value="5x5">5×5</option>
            <option value="6x6">6×6</option>
            <option value="7x7">7×7</option>
            <option value="11x11">11×11</option>
          </select>
        </Field>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:col-span-2"
        >
          <Search className="h-4 w-4" /> Find slots
        </button>
      </div>
    </form>
  );
}

function Field({
  colSpan, icon: Icon, label, children,
}: {
  colSpan: number; icon: typeof Calendar; label: string; children: React.ReactNode;
}) {
  const span: Record<number, string> = { 2: "sm:col-span-2", 3: "sm:col-span-3", 4: "sm:col-span-4" };
  return (
    <div className={`rounded-xl border bg-card px-3 py-2 ${span[colSpan]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-0.5 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        {children}
      </div>
    </div>
  );
}

function SportChips() {
  const sports = [
    { id: "football", label: "Football", Icon: Goal, count: SPORT_COUNTS.football, active: true },
    { id: "cricket", label: "Cricket", Icon: CircleDot, count: SPORT_COUNTS.cricket, active: false },
    { id: "badminton", label: "Badminton", Icon: Zap, count: SPORT_COUNTS.badminton, active: false },
  ];
  return (
    <section className="border-b bg-card py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Browse by sport</h2>
          <Link href="/grounds" className="text-sm font-medium hover:text-primary">All grounds →</Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {sports.map(({ id, label, Icon, count, active }) => (
            <Link
              key={id}
              href={`/grounds?sport=${id}`}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:border-primary/40"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span className="text-[10px] opacity-70">· {count} {count === 1 ? "ground" : "grounds"}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedGrounds() {
  return (
    <section id="grounds" className="bg-muted/30 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Our grounds</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pick the field that fits your match</p>
          </div>
          <Link href="/grounds" className="hidden text-sm font-medium hover:text-primary sm:inline">
            View as list →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GROUNDS.map((g, i) => (
            <GroundCard
              key={g.id}
              ground={g}
              badge={i === 0 ? "Most booked" : i === 2 ? "2 slots left" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function VenueAmenities() {
  const items = [
    { Icon: Car, label: "Free parking" },
    { Icon: Droplets, label: "Showers" },
    { Icon: Lock, label: "Locker rooms" },
    { Icon: Coffee, label: "On-site café" },
    { Icon: Wifi, label: "Free Wi-Fi" },
    { Icon: Heart, label: "First aid" },
  ];
  return (
    <section className="border-y bg-card py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">More than just a pitch</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything you need at the venue, included with every booking.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-3 md:grid-cols-6">
          {items.map(({ Icon, label }) => (
            <div key={label}>
              <Icon className="mx-auto h-7 w-7 text-primary" />
              <p className="mt-2 text-xs font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: 1, title: "Pick a ground", body: "Choose from our 6 grounds — football 5×5 / 6×6 / 7×7 / 11×11, cricket nets or badminton." },
    { n: 2, title: "Pick a slot & pay", body: "Real-time hourly availability. Pay securely via Stripe — card, Apple Pay, Google Pay." },
    { n: 3, title: "Show up & play", body: "Confirmation lands in your inbox. Free cancellation up to 24h before kickoff." },
  ];
  return (
    <section id="how" className="bg-sidebar py-16 text-sidebar-foreground">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-wider text-accent-foreground">
          HOW IT WORKS
        </span>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Three steps to your match
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-8 text-left sm:grid-cols-3">
          {steps.map(({ n, title, body }) => (
            <div key={n}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-base font-extrabold text-accent-foreground">
                {n}
              </span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm opacity-70">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <Link
            href="/grounds"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-accent-foreground hover:opacity-90"
          >
            Browse our grounds <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function VisitUs() {
  return (
    <section id="visit" className="bg-card py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        <div>
          <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-wider text-accent-foreground">
            VISIT US
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            One venue. Six grounds. Open 18 hours a day.
          </h2>
          <dl className="mt-6 space-y-4 text-sm">
            <Detail Icon={MapPin} label="Address">
              {VENUE.address}
              <Link href="#" className="ml-1 text-xs text-primary underline">Get directions →</Link>
            </Detail>
            <Detail Icon={Calendar} label="Open hours">Every day · {VENUE.openHours}</Detail>
            <Detail Icon={ShieldCheck} label="Reception">
              {VENUE.phone} · {VENUE.email}
            </Detail>
          </dl>
        </div>
        <div className="relative h-72 overflow-hidden rounded-2xl border">
          <Image
            src="https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=1200"
            alt="Map preview"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-sidebar/20" />
          <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-lg bg-card p-3 text-sm">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-medium">Google Maps preview · click to open</span>
          </div>
        </div>
      </div>
    </section>
  );
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
