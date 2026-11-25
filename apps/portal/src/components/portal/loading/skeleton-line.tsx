import { cn } from "@/lib/utils";
import { SkeletonBlock } from "./skeleton-block";

/**
 * One line of text: a bar centred in a box as tall as the text's line height (`className`
 * sets that height and the width), so stacked lines take the same space as the real text.
 */
export function SkeletonLine({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex h-5 items-center", className)}>
      <SkeletonBlock className="h-[65%] w-full rounded-md" />
    </div>
  );
}
