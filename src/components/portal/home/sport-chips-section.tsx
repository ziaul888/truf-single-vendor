import Link from "next/link";
import { listPublicGrounds } from "@/services/portal-grounds";
import { SPORT_META, SPORTS } from "@/components/portal/sports";
import type { WebsiteSections } from "@/validations/website-settings";

export async function SportChipsSection({ content }: { content: WebsiteSections["sportChips"] }) {
  const grounds = await listPublicGrounds();
  // All 7 sports with real counts; sports the venue doesn't offer yet are hidden once any ground exists.
  const all = SPORTS.map((id) => ({ id, ...SPORT_META[id], count: grounds.filter((g) => g.sport === id).length }));
  const sports = grounds.length ? all.filter((s) => s.count > 0) : all;
  const top = Math.max(0, ...sports.map((s) => s.count));
  return (
    <section className="border-b bg-card py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">{content.title}</h2>
          <Link href="/grounds" className="text-sm font-medium hover:text-primary">All grounds →</Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {sports.map(({ id, label, Icon, count }) => {
            // Highlight the sport with the most grounds.
            const active = count > 0 && count === top;
            return (
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
