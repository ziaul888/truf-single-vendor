import { cn } from "@/lib/utils";

/** A pulsing placeholder block for portal loading screens. */
export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted", className)} />;
}
