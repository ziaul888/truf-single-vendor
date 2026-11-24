import { PortalLink as Link } from "@/components/portal/turf-portal-scope";
import { turfPortalPath } from "@/lib/turf-portal-path";
import { X } from "lucide-react";
import { venueToday } from "@/lib/slot-format";
import { PortalDatePicker } from "./portal-date-picker";
import { groundsHref, type GroundsQuery } from "./grounds-query";

/**
 * Pick a day to see every ground's free slots. The current filters ride along as hidden fields.
 */
export function GroundsDateBar({ query, filters, slug, timezone }: { query: GroundsQuery; filters?: React.ReactNode; slug?: string; timezone?: string }) {
  const today = venueToday(0, timezone);
  return (
    // Phones: label and filter icon on the first row, date and button on the second. From sm: one wrapping row.
    <form action={turfPortalPath(slug, "/grounds")} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl border bg-card p-3 sm:flex sm:flex-wrap">
      <label htmlFor="grounds-date" className="cursor-pointer text-sm font-medium">
        {query.date ? "Free slots on" : "See free slots for a day"}
      </label>
      {filters && <div className="sm:order-last sm:ml-auto">{filters}</div>}
      <div className="col-span-2 flex items-center gap-2 sm:contents">
        <PortalDatePicker
          key={query.date ?? today}
          id="grounds-date"
          label="Grounds date"
          min={today}
          defaultValue={query.date ?? today}
          className="flex-1 rounded-md border bg-background px-3 py-1 sm:flex-none"
        />
        {(["sport", "format", "surface"] as const).map((k) =>
          query[k] ? <input key={k} type="hidden" name={k} value={query[k]} /> : null,
        )}
        {query.sort !== "recommended" && <input type="hidden" name="sort" value={query.sort} />}
        <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold pointer-coarse:min-h-11 text-primary-foreground hover:opacity-90">
          {query.date ? "Change" : "Show slots"}
        </button>
      </div>
      {query.date && (
        <Link href={groundsHref(query, { date: undefined })} className="col-span-2 flex items-center gap-1 justify-self-end text-xs text-muted-foreground hover:text-foreground sm:col-auto">
          <X className="h-3.5 w-3.5" /> Clear date
        </Link>
      )}
    </form>
  );
}
