import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { GROUNDS } from "@/lib/portal-stub-data";
import { FormatBadge } from "@/components/portal/format-badge";

export const metadata: Metadata = {
  title: "Our grounds",
  description: "Browse all six grounds at Champions Turf — football, cricket and badminton.",
};

export default function GroundsPage() {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
      <FilterSidebar />
      <div>
        <ResultsHeader />
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          {GROUNDS.map((g) => (
            <article
              key={g.id}
              className="group flex overflow-hidden rounded-xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="relative w-32 shrink-0">
                <Image
                  src={g.images[0]!}
                  alt={g.name}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
                <FormatBadge format={g.format} className="absolute left-2 top-2 text-[10px]" />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="font-bold">{g.name}</h3>
                <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                  {g.sport} · {g.surface.replace("-", " ")}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {g.amenities.slice(0, 2).join(" · ")}
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

function ResultsHeader() {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        Showing <strong className="text-foreground">{GROUNDS.length} grounds</strong> at Champions Turf
      </p>
      <select className="rounded-lg border bg-card px-3 py-2 text-sm">
        <option>Sort: Recommended</option>
        <option>Price: Low to high</option>
        <option>Price: High to low</option>
        <option>Format: Smallest first</option>
      </select>
    </div>
  );
}

function FilterSidebar() {
  return (
    <aside className="h-fit rounded-2xl border bg-card p-5 lg:sticky lg:top-20">
      <h3 className="text-sm font-bold uppercase tracking-wide">Filters</h3>

      <FilterGroup title="Sport">
        <Check label="Football" defaultChecked />
        <Check label="Cricket" />
        <Check label="Badminton" />
      </FilterGroup>

      <FilterGroup title="Format">
        <div className="grid grid-cols-3 gap-1.5">
          {["5×5", "6×6", "7×7", "11×11", "Net", "Court"].map((f, i) => (
            <button
              key={f}
              className={`rounded-full border px-2 py-1 text-xs ${
                i === 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:border-primary/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price / hour">
        <input type="range" min={400} max={3500} defaultValue={1500} className="w-full accent-primary" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>৳400</span><span>৳3,500</span>
        </div>
      </FilterGroup>

      <FilterGroup title="Surface">
        <Check label="Outdoor turf" />
        <Check label="Indoor court" />
        <Check label="Covered net" />
      </FilterGroup>

      <button className="mt-6 w-full text-sm font-medium hover:text-primary">
        Clear all filters
      </button>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="space-y-1.5 text-sm">{children}</div>
    </div>
  );
}

function Check({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" defaultChecked={defaultChecked} className="accent-primary" />
      {label}
    </label>
  );
}
