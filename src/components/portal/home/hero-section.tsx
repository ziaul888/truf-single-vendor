import Image from "next/image";
import { Calendar, CircleDot, Grid3x3, Search } from "lucide-react";
import { listPublicGrounds } from "@/services/portal-grounds";
import { addDays, venueToday } from "@/lib/slot-format";
import { SPORT_META, SPORTS } from "@/components/portal/sports";
import type { WebsiteSettings } from "@/validations/website-settings";
import { isUploadedImage } from "./is-uploaded-image";

/**
 * The hero is one static photo and the search box; the headline stays for screen readers only.
 * A single optimised image loads faster on phones than a slider, and keeps one clear action: Find slots.
 */
export async function HeroSection({ hero, venueName }: { hero: WebsiteSettings["hero"]; venueName: string }) {
  const grounds = await listPublicGrounds();

  return (
    <section className="relative flex min-h-80 items-center overflow-hidden sm:min-h-112">
      <Image
        src={hero.imageUrl}
        alt=""
        fill
        priority
        // Uploaded images are served from our own API with a ?v= cache key.
        unoptimized={isUploadedImage(hero.imageUrl)}
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Pitch-themed gradient overlay so the search box stands out */}
      <div className="absolute inset-0 bg-linear-to-b from-sidebar/40 to-sidebar/85" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <h1 className="sr-only">{hero.headline} {venueName}</h1>
        {/* Search box (one ground: straight to its slots on the chosen date) */}
        <SearchBox single={grounds.length === 1} action={grounds.length === 1 ? `/grounds/${grounds[0].id}` : "/grounds"} />
      </div>
    </section>
  );
}

/**
 * Opens /grounds with every matching ground's free slots for that day. With one ground, sport and
 * size would filter nothing, so it asks only for the date. Dates stop at the 7 days the slot picker shows.
 */
function SearchBox({ action, single }: { action: string; single: boolean }) {
  const today = venueToday();
  return (
    <form
      action={action}
      className="relative mx-auto max-w-3xl rounded-2xl bg-card/95 p-3 shadow-2xl backdrop-blur sm:p-4"
    >
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
          className={`inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 ${
            single ? "sm:px-6" : "col-span-2"
          }`}
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
