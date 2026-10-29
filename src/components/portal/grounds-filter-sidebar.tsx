import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FORMATS } from "@/types/ground";
import { FORMAT_LABEL } from "@/lib/portal-stub-data";
import { SPORT_META, SPORTS, SURFACE_LABEL, SURFACES } from "./sports";
import { groundsHref, type GroundsQuery } from "./grounds-query";

// Every option is a link, so filtering works without JavaScript and the URL can be shared.
export function GroundsFilterSidebar({ query }: { query: GroundsQuery }) {
  const anyFilter = Boolean(query.sport || query.format || query.surface);
  return (
    <aside className="h-fit rounded-2xl border bg-card p-5 lg:sticky lg:top-20">
      <h3 className="text-sm font-bold uppercase tracking-wide">Filters</h3>

      <FilterGroup title="Sport">
        {SPORTS.map((s) => (
          <Option
            key={s}
            label={SPORT_META[s].label}
            selected={query.sport === s}
            href={groundsHref(query, { sport: query.sport === s ? undefined : s })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Format">
        <div className="grid grid-cols-3 gap-1.5">
          {FORMATS.map((f) => {
            const selected = query.format === f;
            return (
              <Link
                key={f}
                href={groundsHref(query, { format: selected ? undefined : f })}
                aria-current={selected ? "true" : undefined}
                className={cn(
                  "rounded-full border px-2 py-1 text-center text-xs",
                  selected ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/40"
                )}
              >
                {f === "net" ? "Net" : f === "court" ? "Court" : FORMAT_LABEL[f]}
              </Link>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Surface">
        {SURFACES.map((s) => (
          <Option
            key={s}
            label={SURFACE_LABEL[s]}
            selected={query.surface === s}
            href={groundsHref(query, { surface: query.surface === s ? undefined : s })}
          />
        ))}
      </FilterGroup>

      {anyFilter && (
        <Link
          href={groundsHref(query, { sport: undefined, format: undefined, surface: undefined })}
          className="mt-6 block w-full text-center text-sm font-medium hover:text-primary"
        >
          Clear all filters
        </Link>
      )}
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="space-y-1.5 text-sm">{children}</div>
    </div>
  );
}

function Option({ label, selected, href }: { label: string; selected: boolean; href: string }) {
  return (
    <Link href={href} aria-current={selected ? "true" : undefined} className="flex items-center gap-2 hover:text-primary">
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded border",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
        )}
      >
        {selected && <Check className="h-3 w-3" />}
      </span>
      {label}
    </Link>
  );
}
