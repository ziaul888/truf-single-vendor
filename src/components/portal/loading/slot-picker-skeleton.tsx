import { SkeletonBlock } from "./skeleton-block";
import { SkeletonLine } from "./skeleton-line";

/** Match the price header, date buttons, and loading times in SlotPicker. */
export function SlotPickerSkeleton() {
  return (
    <div className="@container min-w-0 rounded-2xl border bg-card shadow-sm">
      <div className="space-y-2 rounded-t-2xl border-b bg-muted/40 px-4 py-4 @sm:px-5">
        <SkeletonLine className="h-3 w-20" />
        <SkeletonLine className="h-6 w-28" />
      </div>

      <div className="space-y-5 px-4 py-5 @sm:px-5">
        <div>
          <SkeletonLine className="mb-2.5 h-4 w-24" />
          <div className="grid grid-cols-4 gap-2 @sm:grid-cols-7 @sm:gap-1.5 @md:gap-2">
            {Array.from({ length: 7 }).map((_, i) => <SkeletonBlock key={i} className="h-16" />)}
          </div>
        </div>

        <div>
          <SkeletonLine className="mb-2.5 h-4 w-24" />
          <div className="grid grid-cols-2 gap-2 @sm:grid-cols-3 @xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonBlock key={i} className="h-16" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
