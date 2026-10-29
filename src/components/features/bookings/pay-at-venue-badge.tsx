import { Store } from "lucide-react";

/** The portal customer chose to pay cash at the venue. */
export function PayAtVenueBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
      <Store className="h-3 w-3" />Pay at venue
    </span>
  );
}
