import { PortalLink as Link } from "@/components/portal/turf-portal-scope";
import { listPublicGrounds } from "@/services/portal-grounds";
import { SPORT_META, SPORTS } from "@/components/portal/sports";
import type { WebsiteSections } from "@/validations/website-settings";
import { HomeSection, SectionHeading } from "./home-section";

export async function SportChipsSection({ content, slug }: { content: WebsiteSections["sportChips"]; slug?: string }) {
  const grounds = await listPublicGrounds({}, slug);
  // One ground means one chip: nothing to browse by sport.
  if (grounds.length === 1) return null;
  // All 7 sports with real counts; sports the venue doesn't offer yet are hidden once any ground exists.
  const all = SPORTS.map((id) => ({ id, ...SPORT_META[id], count: grounds.filter((g) => g.sport === id).length }));
  const sports = grounds.length ? all.filter((s) => s.count > 0) : all;
  return (
    <HomeSection className="pb-0 sm:pb-0">
      <SectionHeading title={content.title} href="/grounds" linkLabel="All grounds" />
      {/* One swipeable row on phones instead of a tall wrapped block */}
      <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
        {sports.map(({ id, label, Icon, count }) => (
          <li key={id} className="shrink-0">
            <Link
              href={`/grounds?sport=${id}`}
              className="flex items-center gap-3 rounded-2xl border bg-card py-2.5 pl-2.5 pr-5 transition-colors hover:border-primary/50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold">{label}</span>
                <span className="block text-xs text-muted-foreground">{count} {count === 1 ? "ground" : "grounds"}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </HomeSection>
  );
}
