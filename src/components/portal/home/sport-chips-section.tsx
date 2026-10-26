import Link from "next/link";
import { CircleDot, Goal, Zap } from "lucide-react";
import { SPORT_COUNTS } from "@/lib/portal-stub-data";
import type { WebsiteSections } from "@/validations/website-settings";

export function SportChipsSection({ content }: { content: WebsiteSections["sportChips"] }) {
  const sports = [
    { id: "football", label: "Football", Icon: Goal, count: SPORT_COUNTS.football, active: true },
    { id: "cricket", label: "Cricket", Icon: CircleDot, count: SPORT_COUNTS.cricket, active: false },
    { id: "badminton", label: "Badminton", Icon: Zap, count: SPORT_COUNTS.badminton, active: false },
  ];
  return (
    <section className="border-b bg-card py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">{content.title}</h2>
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
