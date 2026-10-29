import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { listPublicGrounds } from "@/services/portal-grounds";
import { parseGroundsQuery, sortGrounds, type GroundsQuery } from "@/components/portal/grounds-query";
import { GroundsFilterSidebar } from "@/components/portal/grounds-filter-sidebar";
import { GroundsSortSelect } from "@/components/portal/grounds-sort-select";
import { FormatBadge } from "@/components/portal/format-badge";

export const metadata: Metadata = {
  title: "Our grounds",
  description: "Browse the grounds at Champions Turf and book an hourly slot.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function GroundsPage({ searchParams }: { searchParams: SearchParams }) {
  const query = parseGroundsQuery(await searchParams);
  const { sport, format, surface } = query;
  const grounds = sortGrounds(await listPublicGrounds({ sport, format, surface }), query.sort);
  const filtered = Boolean(sport || format || surface);

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
      <GroundsFilterSidebar query={query} />
      <div>
        <ResultsHeader count={grounds.length} query={query} />
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          {grounds.length === 0 && (
            <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground md:col-span-2">
              {filtered ? "No grounds match these filters." : "No grounds are open for booking right now."}
            </p>
          )}
          {grounds.map((g) => (
            <article
              key={g.id}
              className="group flex overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative w-32 shrink-0">
                {g.images?.[0] ? (
                  <Image src={g.images[0]} alt={g.name} fill sizes="128px" className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-linear-to-br from-primary/80 to-primary/40" />
                )}
                {g.format && <FormatBadge format={g.format} className="absolute left-2 top-2 text-[10px]" />}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-bold">{g.name}</h3>
                <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                  {[g.sport, g.surface?.replace("-", " ")].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {g.amenities?.length
                    ? g.amenities.slice(0, 2).join(" · ")
                    : `Open ${String(g.openHour).padStart(2, "0")}:00–${String(g.closeHour).padStart(2, "0")}:00`}
                </p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <p className="font-bold">
                    ৳{g.hourlyRate.toLocaleString()}
                    <span className="text-xs font-normal text-muted-foreground">/hr</span>
                  </p>
                  <Link
                    href={`/grounds/${g.id}`}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                  >
                    View slots
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultsHeader({ count, query }: { count: number; query: GroundsQuery }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing <strong className="text-foreground">{count} {count === 1 ? "ground" : "grounds"}</strong> at Champions Turf
      </p>
      <GroundsSortSelect query={query} />
    </div>
  );
}
