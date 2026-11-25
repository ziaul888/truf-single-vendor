import { Banknote, Clock, LayoutGrid, Timer, Trophy, Users, type LucideIcon } from "lucide-react";
import { listPublicGrounds } from "@/services/portal-grounds";
import { SPORT_META } from "@/components/portal/sports";
import { durationLabel } from "@/lib/slot-format";
import { hourToTime } from "@/lib/ground-format";
import { HomeSection } from "./home-section";

interface Stat { Icon: LucideIcon; value: string; label: string }

/** Four at-a-glance facts straight under the hero: the one ground's, or the whole venue's. */
export async function StatsStrip({ slug }: { slug?: string } = {}) {
  const grounds = await listPublicGrounds({}, slug);
  if (grounds.length === 0) return null;

  const hours = `${hourToTime(Math.min(...grounds.map((g) => g.openHour)))}–${hourToTime(Math.max(...grounds.map((g) => g.closeHour)))}`;
  const stats: Stat[] = grounds.length === 1 ? singleGroundStats(grounds[0], hours) : venueStats(grounds, hours);

  return (
    <HomeSection className="pb-0 sm:pb-0">
      <ul className="grid grid-cols-2 overflow-hidden rounded-2xl border bg-card sm:grid-cols-4">
        {stats.map(({ Icon, value, label }) => (
          <li key={label} className="flex min-w-0 flex-col gap-2 px-3 py-3.5 even:border-l nth-[n+3]:border-t sm:gap-3 sm:border-l sm:nth-[n+3]:border-t-0 sm:first:border-l-0 sm:p-4 lg:flex-row lg:items-center lg:px-5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary lg:size-10">
              <Icon className="size-4 lg:size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-base font-extrabold leading-tight tracking-tight tabular-nums lg:text-lg">{value}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
            </div>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}

function singleGroundStats(g: (Awaited<ReturnType<typeof listPublicGrounds>>)[number], hours: string): Stat[] {
  const fourth: Stat =
    g.capacity != null ? { Icon: Users, value: String(g.capacity), label: "Players" }
    : g.format ? { Icon: LayoutGrid, value: g.format.replace("x", "×"), label: "Format" }
    : { Icon: Trophy, value: g.sport ? SPORT_META[g.sport].label : "—", label: "Sport" };
  return [
    { Icon: Clock, value: hours, label: "Daily hours" },
    { Icon: Banknote, value: `৳${g.hourlyRate.toLocaleString()}`, label: "Per hour" },
    { Icon: Timer, value: durationLabel(g.slotDurationMinutes ?? 60), label: "Per slot" },
    fourth,
  ];
}

function venueStats(grounds: Awaited<ReturnType<typeof listPublicGrounds>>, hours: string): Stat[] {
  const sports = new Set(grounds.map((g) => g.sport)).size;
  return [
    { Icon: LayoutGrid, value: String(grounds.length), label: "Grounds" },
    { Icon: Trophy, value: String(sports), label: sports === 1 ? "Sport" : "Sports" },
    { Icon: Clock, value: hours, label: "Daily hours" },
    { Icon: Banknote, value: `৳${Math.min(...grounds.map((g) => g.hourlyRate)).toLocaleString()}`, label: "From, per hour" },
  ];
}
