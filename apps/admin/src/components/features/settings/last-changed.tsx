import { timeAgo } from "@/components/features/bookings/booking-status-helpers";
import type { Audited } from "@/types/settings";

/** "Last changed by Manager, 2h ago" under a settings page title. */
export function LastChanged({ updatedAt, updatedBy }: Partial<Audited>) {
  if (!updatedAt) return <p className="text-xs text-muted-foreground">Not changed yet: showing the defaults.</p>;
  return (
    <p className="text-xs text-muted-foreground" title={new Date(updatedAt).toLocaleString()}>
      Last changed by {updatedBy?.name ?? "a removed account"}, {timeAgo(updatedAt)}
    </p>
  );
}
