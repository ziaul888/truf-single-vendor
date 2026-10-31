import Link from "next/link";
import { CalendarDays, X } from "lucide-react";
import { venueToday } from "@/lib/slot-format";
import { groundsHref, type GroundsQuery } from "./grounds-query";

/**
 * Pick a day to see every ground's free slots. A plain GET form, so it works without
 * JavaScript; the current filters ride along as hidden fields.
 */
export function GroundsDateBar({ query }: { query: GroundsQuery }) {
  return (
    <form action="/grounds" className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
      <CalendarDays className="h-4 w-4 text-primary" />
      <label htmlFor="grounds-date" className="text-sm font-medium">
        {query.date ? "Free slots on" : "See free slots for a day"}
      </label>
      <input
        id="grounds-date"
        type="date"
        name="date"
        required
        min={venueToday()}
        defaultValue={query.date ?? venueToday()}
        className="rounded-md border bg-background px-2 py-1 text-sm"
      />
      {(["sport", "format", "surface"] as const).map((k) =>
        query[k] ? <input key={k} type="hidden" name={k} value={query[k]} /> : null,
      )}
      {query.sort !== "recommended" && <input type="hidden" name="sort" value={query.sort} />}
      <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
        {query.date ? "Change" : "Show slots"}
      </button>
      {query.date && (
        <Link href={groundsHref(query, { date: undefined })} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" /> Clear date
        </Link>
      )}
    </form>
  );
}
