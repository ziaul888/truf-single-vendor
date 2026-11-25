import { MapPin, Navigation } from "lucide-react";
import { directionsUrl } from "@/lib/maps";

/**
 * Where the ground is, with a Google Maps directions button. Uses the ground's own
 * address (set on the ground in the dashboard), or the venue's when the ground has none.
 */
export function GroundLocation({ groundAddress, venueAddress }: { groundAddress?: string | null; venueAddress: string }) {
  const address = groundAddress?.trim() || venueAddress.trim();
  if (!address) return null;

  return (
    <section className="mt-6 border-b pb-8">
      <h2 className="mb-3 font-bold">Location</h2>
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex min-w-0 items-start gap-3 text-sm">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <span className="min-w-0">
            <span className="block font-semibold">{address}</span>
            {!groundAddress?.trim() && <span className="text-xs text-muted-foreground">At the main venue</span>}
          </span>
        </p>
        <a
          href={directionsUrl(address)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Navigation className="h-4 w-4" /> Get directions
        </a>
      </div>
    </section>
  );
}
