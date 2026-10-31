import { cn } from "@/lib/utils";

/** A shimmering placeholder block for portal loading states. */
export function SkeletonBlock({ className }: { className?: string }) {
  return <div aria-hidden className={cn("shimmer rounded-xl", className)} />;
}
