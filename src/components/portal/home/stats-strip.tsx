import { Banknote, Clock, LayoutGrid, Timer, Trophy, Users, type LucideIcon } from "lucide-react";
import { listPublicGrounds } from "@/services/portal-grounds";
import { SPORT_META } from "@/components/portal/sports";
import { durationLabel } from "@/lib/slot-format";
import { HomeSection } from "./home-section";

interface Stat { Icon: LucideIcon; value: string; label: string }

const pad = (n: number) => String(n).padStart(2, "0");

/** Four at-a-glance facts straight under the hero: the one ground's, or the whole venue's. */
export async function StatsStrip({ slug }: { slug?: string } = {}) {
  const grounds = await listPublicGrounds({}, slug);
  if (grounds.length === 0) return null;

  const hours = `${pad(Math.min(...grounds.map((g) => g.openHour)))}–${pad(Math.max(...grounds.map((g) => g.closeHour)))}`;
  const stats: Stat[] = grounds.length === 1 ? singleGroundStats(grounds[0], hours) : venueStats(grounds, hours);

  return (
    <HomeSection className="pb-0 sm:pb-0">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ Icon, value, label }) => (
          <li key={label} className="flex items-center gap-3 rounded-2xl border bg-card p-3 sm:p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-extrabold leading-tight tracking-tight">{value}</span>
              <span className="block truncate text-xs text-muted-foreground">{label}</span>
            </span>
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
