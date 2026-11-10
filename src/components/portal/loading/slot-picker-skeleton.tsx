import { SkeletonBlock } from "./skeleton-block";
import { SkeletonLine } from "./skeleton-line";

/**
 * SlotPicker as it first renders, before its slots arrive: price, the 7-day strip,
 * six hour cells (its own loading state) and the Continue button.
 */
export function SlotPickerSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-1 flex items-baseline gap-2">
        <SkeletonLine className="h-8 w-24" />
        <SkeletonLine className="w-12" />
      </div>
      <SkeletonLine className="mb-5 h-4 w-56 max-w-full" />

      <SkeletonLine className="mb-2 h-4 w-20" />
      <div className="-mx-1 flex gap-2 overflow-hidden px-1 pb-2">
        {Array.from({ length: 7 }).map((_, i) => <SkeletonBlock key={i} className="h-20.25 w-16 shrink-0" />)}
      </div>

      <SkeletonLine className="mt-5 mb-2 h-4 w-28" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} className="h-11 rounded-lg" />)}
      </div>

      <SkeletonBlock className="mt-4 h-12 rounded-lg" />
    </div>
  );
}
