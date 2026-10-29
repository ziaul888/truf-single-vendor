import Image from "next/image";
import {
  BadgeCheck, Calendar, CircleDot, Grid3x3, Search, ShieldCheck, Zap,
} from "lucide-react";
import { listPublicGrounds } from "@/services/portal-grounds";
import { SPORT_META, SPORTS } from "@/components/portal/sports";
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

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-2xl text-sidebar-foreground">
          {hero.badge && (
            <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold tracking-wider text-accent-foreground">
              {hero.badge}
            </span>
          )}
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            {hero.headline}<br />
            <span className="text-accent">{venueName}</span>
          </h1>
          {hero.description && (
            <p className="mt-4 max-w-xl text-base opacity-85 sm:text-lg">{hero.description}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm opacity-90">
            <Stat n={String(grounds.length)} label={grounds.length === 1 ? "ground" : "grounds"} />
            <Stat n={String(sports)} label={sports === 1 ? "sport" : "sports"} />
            <Stat n={hours} label="daily hours" />
          </div>
        </div>

        {/* Search box */}
        <SearchBox />

        <TrustBadges />
      </div>
    </section>
  );
}

function TrustBadges() {
  return (
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
            {SPORTS.map((s) => (
              <option key={s} value={s}>{SPORT_META[s].label}</option>
            ))}
          </select>
        </Field>
        <Field colSpan={3} icon={Grid3x3} label="Format">
          <select name="format" className="w-full bg-transparent text-sm font-medium outline-none">
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
