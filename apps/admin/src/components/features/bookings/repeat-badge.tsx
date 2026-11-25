import { Repeat } from "lucide-react";

/** The booking is one date of a repeat booking (series). */
export function RepeatBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
      <Repeat className="h-3 w-3" />Repeat
    </span>
  );
}
