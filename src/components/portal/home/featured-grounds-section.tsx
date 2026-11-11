import Link from "next/link";
import { GroundCard } from "@/components/portal/ground-card";
import { listPublicGrounds } from "@/services/portal-grounds";
import type { WebsiteSections } from "@/validations/website-settings";

const FEATURED_COUNT = 6;

export async function FeaturedGroundsSection({ content }: { content: WebsiteSections["featuredGrounds"] }) {
  const grounds = (await listPublicGrounds()).slice(0, FEATURED_COUNT);

  return (
    <section id="grounds" className="bg-muted/30 py-8 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between sm:mb-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-3xl">{content.title}</h2>
            {content.subtitle && <p className="mt-1 hidden text-sm sm:block text-muted-foreground">{content.subtitle}</p>}
          </div>
          <Link href="/grounds" className="text-sm font-medium hover:text-primary">
            View as list →
          </Link>
        </div>
        {/* A lone card in a 3-column grid looks lost: let it span the width on larger screens. */}
        <div className={grounds.length === 1 ? "mx-auto max-w-md sm:max-w-2xl" : "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"}>
          {grounds.map((g) => (
            <GroundCard key={g.id} ground={g} />
          ))}
        </div>
      </div>
    </section>
  );
}
