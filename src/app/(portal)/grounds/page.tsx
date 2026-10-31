import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getPublicSlots, listPublicGrounds } from "@/services/portal-grounds";
import {
  parseGroundsQuery,
  sortGrounds,
  type GroundsQuery,
} from "@/components/portal/grounds-query";
import { GroundsFilterSidebar } from "@/components/portal/grounds-filter-sidebar";
import { GroundsSortSelect } from "@/components/portal/grounds-sort-select";
import { FormatBadge } from "@/components/portal/format-badge";
import { GroundsDateBar } from "@/components/portal/grounds-date-bar";
import { GroundFreeSlots } from "@/components/portal/ground-free-slots";
import type { PublicSlot } from "@/types/slot";

export const metadata: Metadata = {
  title: "Our grounds",
  description: "Browse the grounds at Champions Turf and book an hourly slot.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function GroundsPage({ searchParams }: { searchParams: SearchParams }) {
  const query = parseGroundsQuery(await searchParams);
  const { sport, format, surface } = query;
  const sorted = sortGrounds(await listPublicGrounds({ sport, format, surface }), query.sort);
  const filtered = Boolean(sport || format || surface);
  const slotsByGround = query.date
    ? await slotsFor(
        sorted.map((g) => g.id),
        query.date
      )
    : null;
  // With a date, grounds that still have free slots come first (keeping the chosen sort within each group).
  const hasFree = (id: string) => slotsByGround?.get(id)?.some((s) => s.available) ?? false;
  const grounds = slotsByGround
    ? [...sorted].sort((a, b) => Number(hasFree(b.id)) - Number(hasFree(a.id)))
    : sorted;

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
      <GroundsFilterSidebar query={query} />
      <div>
        <GroundsDateBar query={query} />
        <div className="mt-4">
          <ResultsHeader count={grounds.length} query={query} />
        </div>
        <div className={`mt-4 grid grid-cols-1 gap-5 ${slotsByGround ? "" : "md:grid-cols-2"}`}>
          {grounds.length === 0 && (
            <p className="text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm md:col-span-2">
              {filtered
                ? "No grounds match these filters."
                : "No grounds are open for booking right now."}
            </p>
          )}
          {grounds.map((g) => (
            <article
              key={g.id}
              className="group bg-card overflow-hidden rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex">
                <div className="relative w-32 shrink-0">
                  {g.images?.[0] ? (
                    <Image
                      src={g.images[0]}
                      alt={g.name}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="from-primary/80 to-primary/40 h-full w-full bg-linear-to-br" />
                  )}
                  {g.format && (
                    <FormatBadge format={g.format} className="absolute top-2 left-2 text-[10px]" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-bold">{g.name}</h3>
                  <p className="text-muted-foreground mt-0.5 text-xs capitalize">
                    {[g.sport, g.surface?.replace("-", " ")].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-muted-foreground mt-1 text-[11px]">
                    {g.amenities?.length
                      ? g.amenities.slice(0, 2).join(" · ")
                      : `Open ${String(g.openHour).padStart(2, "0")}:00–${String(g.closeHour).padStart(2, "0")}:00`}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <p className="font-bold">
                      ৳{g.hourlyRate.toLocaleString()}
                      <span className="text-muted-foreground text-xs font-normal">/hr</span>
                    </p>
                    <Link
                      href={`/grounds/${g.id}`}
                      className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-xs font-semibold hover:opacity-90"
                    >
                      View ground
                    </Link>
                  </div>
                </div>
              </div>
              {slotsByGround && query.date && (
                <div className="border-t p-4">
                  <GroundFreeSlots
                    groundId={g.id}
                    date={query.date}
                    slots={slotsByGround.get(g.id) ?? []}
                  />
                </div>
              )}
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
      <p className="text-muted-foreground text-sm">
        Showing{" "}
        <strong className="text-foreground">
          {count} {count === 1 ? "ground" : "grounds"}
        </strong>{" "}
        at Champions Turf
      </p>
      <GroundsSortSelect query={query} />
    </div>
  );
}

/** Each ground's slots on one day, fetched in parallel. */
async function slotsFor(groundIds: string[], date: string): Promise<Map<string, PublicSlot[]>> {
  const lists = await Promise.all(groundIds.map((id) => getPublicSlots(id, date)));
  return new Map(groundIds.map((id, i) => [id, lists[i]]));
}
