import { FallbackImage } from "@/components/fallback-image";
import { Calendar, CircleDot, Grid3x3, Search } from "lucide-react";
import { listPublicGrounds } from "@/services/portal-grounds";
import { addDays, venueHourNow, venueToday } from "@/lib/slot-format";
import { SPORT_META, SPORTS, SURFACE_LABEL } from "@/components/portal/sports";
import { HeroMedia } from "./hero-media";
import { SearchForm } from "./search-form";
import type { Ground } from "@/types/api";
import type { WebsiteSettings } from "@/validations/website-settings";

/**
 * The website's hero photo with a booking card floating at its bottom. With one ground,
 * the card shows that ground's details and the search asks only for a date.
 */
export async function HeroSection({ hero, venueName }: { hero: WebsiteSettings["hero"]; venueName: string }) {
  const grounds = await listPublicGrounds();
  const single = grounds.length === 1 ? grounds[0] : null;

  return (
    <section>
      <div className="relative flex h-96 sm:h-112 items-end overflow-hidden">
        <FallbackImage
          src={hero.imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <HeroMedia videoUrl={hero.videoUrl} posterUrl={hero.imageUrl} />
        {/* Light at the top so the photo shows, darker at the bottom behind the card */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-sidebar/10 to-sidebar/70" />
        <OpenNow grounds={grounds} />

        <div className="relative w-full px-4 pb-4 sm:px-6 sm:pb-10 lg:px-8">
          <BookingCard grounds={grounds} single={single} venueName={venueName} />
        </div>
      </div>
    </section>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/** A glass pill on the photo: is the venue taking bookings right now (venue time), and until when. */
function OpenNow({ grounds }: { grounds: Ground[] }) {
  if (grounds.length === 0) return null;
  const opens = Math.min(...grounds.map((g) => g.openHour));
  const closes = Math.max(...grounds.map((g) => g.closeHour));
  const now = venueHourNow();
  const open = now >= opens && now < closes;
  return (
    <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-card/80 px-3 py-1.5 text-xs font-semibold backdrop-blur-md sm:left-6 sm:top-6 lg:left-8">
      <span className={`h-2 w-2 rounded-full ${open ? "bg-success" : "bg-warning"}`} />
      {open ? `Open now · until ${pad(closes)}:00` : `Closed now · opens ${pad(opens)}:00`}
    </span>
  );
}

function cardSummary(grounds: Ground[], single: Ground | null, venueName: string) {
  if (single) {
    const kind = [single.sport && SPORT_META[single.sport].label, single.surface && SURFACE_LABEL[single.surface]];
    const hours = `${pad(single.openHour)}:00–${pad(single.closeHour)}:00`;
    return { title: single.name, subtitle: [...kind, hours].filter(Boolean).join(" · "), price: `৳${single.hourlyRate.toLocaleString()}`, from: false };
  }
  if (grounds.length === 0) return { title: venueName, subtitle: "", price: "", from: false };
  const sports = new Set(grounds.map((g) => g.sport)).size;
  return {
    title: venueName,
    subtitle: `${grounds.length} grounds · ${sports} ${sports === 1 ? "sport" : "sports"}`,
    price: `৳${Math.min(...grounds.map((g) => g.hourlyRate)).toLocaleString()}`,
    from: true,
  };
}

/**
 * Opens /grounds with every matching ground's free slots for that day. With one ground, sport and
 * size would filter nothing, so it asks only for the date. Dates stop at the 7 days the slot picker shows.
 */
function BookingCard({ grounds, single, venueName }: { grounds: Ground[]; single: Ground | null; venueName: string }) {
  const today = venueToday();
  const { title, subtitle, price, from } = cardSummary(grounds, single, venueName);
  return (
    <SearchForm
      action={single ? `/grounds/${single.id}` : "/grounds"}
      className="mx-auto max-w-3xl rounded-3xl border border-sidebar-foreground/20 bg-card/85 p-4 shadow-2xl backdrop-blur-xl sm:p-5"
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {price && (
          <p className="shrink-0 text-right">
            {from && <span className="block text-[11px] text-muted-foreground">From</span>}
            <span className="text-xl font-extrabold text-primary">{price}</span>
            <span className="text-xs text-muted-foreground">/hr</span>
          </p>
        )}
      </div>

      <div className={`grid gap-2 sm:gap-3 ${single ? "grid-cols-1 sm:grid-cols-[1fr_auto]" : "grid-cols-2 sm:grid-cols-12"}`}>
        <Field colSpan={single ? undefined : 4} icon={Calendar} label="Date">
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
        {!single && <SportAndFormat />}
        <button
          type="submit"
          className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 ${
            single ? "sm:px-8" : "col-span-2"
          }`}
        >
          <Search className="h-4 w-4" /> Find slots
        </button>
      </div>
    </SearchForm>
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
  const span: Record<number, string> = { 3: "sm:col-span-3", 4: "col-span-2 sm:col-span-4" };
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
