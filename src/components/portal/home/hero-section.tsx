import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck, Calendar, CircleDot, Grid3x3, Search, ShieldCheck, Zap,
} from "lucide-react";
import { listPublicGrounds } from "@/services/portal-grounds";
import { addDays, venueToday } from "@/lib/slot-format";
import { SPORT_META, SPORTS, SURFACE_LABEL } from "@/components/portal/sports";
import type { Ground } from "@/types/api";
import type { WebsiteSettings } from "@/validations/website-settings";
import { isUploadedImage } from "./is-uploaded-image";

const pad = (n: number) => String(n).padStart(2, "0");

export async function HeroSection({ hero, venueName }: { hero: WebsiteSettings["hero"]; venueName: string }) {
  const grounds = await listPublicGrounds();
  const sports = new Set(grounds.map((g) => g.sport)).size;
  const hours = grounds.length
    ? `${pad(Math.min(...grounds.map((g) => g.openHour)))}–${pad(Math.max(...grounds.map((g) => g.closeHour)))}`
    : "—";

  return (
    <section className="relative overflow-hidden">
      <Image
        src={hero.imageUrl}
        alt=""
        fill
        priority
        // Uploaded images are served from our own API with a ?v= cache key.
        unoptimized={isUploadedImage(hero.imageUrl)}
        sizes="100vw"
        className="object-cover"
      />
      {/* Pitch-themed gradient overlay so text stays legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-sidebar/60 to-sidebar/90" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-2xl text-sidebar-foreground">
          {hero.badge && (
            <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-wider text-accent-foreground">
              {hero.badge}
            </span>
          )}
          <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:mt-4 sm:text-6xl">
            {hero.headline}<br />
            <span className="text-accent">{venueName}</span>
          </h1>
          {grounds.length === 1 && <GroundChips ground={grounds[0]} />}
          {hero.description && (
            <p className="mt-3 line-clamp-3 max-w-xl text-sm opacity-85 sm:mt-4 sm:line-clamp-none sm:text-lg">{hero.description}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-sm opacity-90 sm:mt-6 sm:gap-x-8 sm:gap-y-3">
            {/* "1 ground · 1 sport" says nothing to a one-ground venue: show its hours and price instead. */}
            {grounds.length === 1 ? (
              <>
                <Stat n={hours} label="daily hours" />
                <Stat n={`৳${grounds[0].hourlyRate.toLocaleString()}`} label="per hour" />
              </>
            ) : (
              <>
                <Stat n={String(grounds.length)} label="grounds" />
                <Stat n={String(sports)} label={sports === 1 ? "sport" : "sports"} />
                <Stat n={hours} label="daily hours" />
              </>
            )}
          </div>
        </div>

        {/* One ground: pick a day and land on its slots. Several: search across grounds. */}
        {grounds.length === 1 ? <DayPicker ground={grounds[0]} /> : <SearchBox />}

        <TrustBadges />
      </div>
    </section>
  );
}

function TrustBadges() {
  return (
    <div className="relative mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-sidebar-foreground/80 sm:mt-10 sm:gap-x-8 sm:gap-y-3 sm:text-sm">
      <span className="flex items-center gap-2">
        {/* Card payments can be switched off in Settings, so no "Stripe" claim here. */}
        <ShieldCheck className="h-4 w-4 text-accent" /> Secure booking
      </span>
      <span className="flex items-center gap-2">
        <BadgeCheck className="h-4 w-4 text-accent" /> Money-back on cancellation
      </span>
      <span className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-accent" /> Instant email confirmation
      </span>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <span className="rounded-full bg-sidebar-foreground/10 px-3 py-1 sm:bg-transparent sm:p-0">
      <span className="text-lg font-extrabold tracking-tight text-accent sm:text-2xl">{n}</span>{" "}
      <span className="text-sm">{label}</span>
    </span>
  );
}

const DAY_COUNT = 7;

/**
 * One-ground venues: a swipeable strip of the next 7 days (the span the slot picker shows).
 * Each day opens that ground's slots for the date, so a booking is one tap from the home page.
 */
function DayPicker({ ground }: { ground: Ground }) {
  const today = venueToday();
  const days = Array.from({ length: DAY_COUNT }, (_, i) => addDays(today, i));
  return (
    <div className="relative mt-6 max-w-3xl rounded-2xl bg-card/95 p-3 shadow-2xl backdrop-blur sm:mt-10 sm:p-4">
      <p className="flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Calendar className="h-4 w-4 text-primary" /> Pick a day to see free slots
      </p>
      <ul className="-mx-3 mt-2 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
        {days.map((date, i) => (
          <li key={date} className="shrink-0 snap-start">
            <Link
              href={`/grounds/${ground.id}?date=${date}`}
              className={`flex h-16 w-14 flex-col items-center justify-center rounded-xl border text-center transition-colors sm:w-16 ${
                i === 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:border-primary/40"
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
                {i === 0 ? "Today" : dayName(date)}
              </span>
              <span className="text-lg font-extrabold leading-tight">{date.slice(8)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={`/grounds/${ground.id}?date=${today}`}
        className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 sm:w-auto sm:px-8"
      >
        Book now · ৳{ground.hourlyRate.toLocaleString()}/hr
      </Link>
    </div>
  );
}

/** The lone ground at a glance: its name, sport and surface. */
function GroundChips({ ground }: { ground: Ground }) {
  const sport = ground.sport && SPORT_META[ground.sport];
  const chips = [ground.name, sport && sport.label, ground.surface && SURFACE_LABEL[ground.surface]].filter(Boolean);
  return (
    <ul className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
      {chips.map((chip) => (
        <li key={chip} className="inline-flex items-center gap-1.5 rounded-full border border-sidebar-foreground/20 px-3 py-1">
          {sport && chip === sport.label && <sport.Icon className="h-3.5 w-3.5 text-accent" />}
          {chip}
        </li>
      ))}
    </ul>
  );
}

const dayName = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });

/**
 * Multi-ground venues: opens /grounds with every matching ground's free slots for that day.
 * Dates stop at the 7 days the slot picker shows.
 */
function SearchBox() {
  const today = venueToday();
  return (
    <form
      action="/grounds"
      className="relative mt-6 max-w-3xl sm:mt-10 rounded-2xl bg-card/95 p-3 shadow-2xl backdrop-blur sm:p-4"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-12 sm:gap-3">
        <Field colSpan={4} icon={Calendar} label="Date">
          <input
            type="date"
            name="date"
            className="w-full bg-transparent text-base font-medium outline-none sm:text-sm"
            required
            min={today}
            max={addDays(today, 6)}
            defaultValue={today}
          />
        </Field>
        <SportAndFormat />
        <button
          type="submit"
          className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Search className="h-4 w-4" /> Find slots
        </button>
      </div>
    </form>
  );
}

function SportAndFormat() {
  return (
    <>
      <Field colSpan={3} icon={CircleDot} label="Sport">
        <select name="sport" className="w-full bg-transparent text-base font-medium outline-none sm:text-sm">
          <option value="">Any sport</option>
          {SPORTS.map((s) => (
            <option key={s} value={s}>{SPORT_META[s].label}</option>
          ))}
        </select>
      </Field>
      <Field colSpan={3} icon={Grid3x3} label="Format">
        <select name="format" className="w-full bg-transparent text-base font-medium outline-none sm:text-sm">
          <option value="">Any size</option>
          <option value="4x4">4×4</option>
          <option value="5x5">5×5</option>
          <option value="6x6">6×6</option>
          <option value="7x7">7×7</option>
          <option value="8x8">8×8</option>
          <option value="9x9">9×9</option>
          <option value="11x11">11×11</option>
        </select>
      </Field>
    </>
  );
}

function Field({
  colSpan, icon: Icon, label, children,
}: {
  colSpan?: number; icon: typeof Calendar; label: string; children: React.ReactNode;
}) {
  const span: Record<number, string> = { 2: "sm:col-span-2", 3: "sm:col-span-3", 4: "col-span-2 sm:col-span-4" };
  return (
    <div className={`rounded-xl border bg-card px-3 py-2 ${colSpan ? span[colSpan] : ""}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-0.5 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        {children}
      </div>
    </div>
  );
}
