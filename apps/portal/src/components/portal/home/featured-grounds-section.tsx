import { GroundTile } from "@/components/portal/home/ground-tile";
import { SlotPicker } from "@/components/portal/slot-picker";
import { listPublicGrounds } from "@/services/portal-grounds";
import type { WebsiteSections } from "@/validations/website-settings";
import { HomeSection, SectionHeading } from "./home-section";

const FEATURED_COUNT = 6;

export async function FeaturedGroundsSection({ content, slug }: { content: WebsiteSections["featuredGrounds"]; slug?: string }) {
  const grounds = (await listPublicGrounds({}, slug)).slice(0, FEATURED_COUNT);
  if (grounds.length === 0) return null;
  const single = grounds.length === 1 ? grounds[0] : null;

  return (
    <HomeSection id="grounds" className="scroll-mt-16">
      <SectionHeading title={content.title} subtitle={content.subtitle}
        href={single ? undefined : "/grounds"} linkLabel="View all" />
      {single ? (
        <div className="grid items-start gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-6">
          <GroundTile ground={single} wide />
          <SlotPicker ground={single} />
        </div>
      ) : (
        // Swipeable cards on phones, a grid from sm
        <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
          {grounds.map((g) => (
            <li key={g.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <GroundTile ground={g} />
            </li>
          ))}
        </ul>
      )}
    </HomeSection>
  );
}
