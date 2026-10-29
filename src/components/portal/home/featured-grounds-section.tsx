import Link from "next/link";
import { GroundCard } from "@/components/portal/ground-card";
import { listPublicGrounds } from "@/services/portal-grounds";
import type { WebsiteSections } from "@/validations/website-settings";

const FEATURED_COUNT = 6;

export async function FeaturedGroundsSection({ content }: { content: WebsiteSections["featuredGrounds"] }) {
  const grounds = (await listPublicGrounds()).slice(0, FEATURED_COUNT);

  return (
    <section id="grounds" className="bg-muted/30 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{content.title}</h2>
            {content.subtitle && <p className="mt-1 text-sm text-muted-foreground">{content.subtitle}</p>}
          </div>
          <Link href="/grounds" className="hidden text-sm font-medium hover:text-primary sm:inline">
            View as list →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {grounds.map((g) => (
            <GroundCard key={g.id} ground={g} />
          ))}
        </div>
      </div>
    </section>
  );
}
