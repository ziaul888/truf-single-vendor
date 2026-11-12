import { GroundTile } from "@/components/portal/home/ground-tile";
import { listPublicGrounds } from "@/services/portal-grounds";
import type { WebsiteSections } from "@/validations/website-settings";
import { HomeSection, SectionHeading } from "./home-section";

const FEATURED_COUNT = 6;

export async function FeaturedGroundsSection({ content }: { content: WebsiteSections["featuredGrounds"] }) {
  const grounds = (await listPublicGrounds()).slice(0, FEATURED_COUNT);
  if (grounds.length === 0) return null;

  return (
    <HomeSection id="grounds">
      <SectionHeading title={content.title} subtitle={content.subtitle} href="/grounds" linkLabel={grounds.length > 1 ? "View all" : "Slots"} />
      {grounds.length === 1 ? (
        <GroundTile ground={grounds[0]} wide />
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
