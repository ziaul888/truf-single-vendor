import { SkeletonBlock } from "./skeleton-block";
import { SkeletonLine } from "./skeleton-line";

/** Checkout while it loads: title, stepper and the details / payment form beside the booking summary. */
export function CheckoutSkeleton() {
  return (
    <div
      className="page-loading mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8"
      aria-busy="true"
      aria-label="Loading checkout"
    >
      <section>
        <SkeletonLine className="h-9 w-52" />
        <SkeletonLine className="mt-1 w-48" />
        <div className="mt-6 mb-2 flex items-center gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="contents">
              {i > 0 && <span className="h-px flex-1 bg-border" />}
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-7 w-7 rounded-full" />
                <SkeletonLine className="w-12" />
              </div>
            </div>
          ))}
        </div>
        <FormSkeleton />
      </section>
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <SummarySkeleton />
      </aside>
    </div>
  );
}

/** A labelled input as in CheckoutForm's Field. */
function FieldSkeleton({ className, hint }: { className?: string; hint?: boolean }) {
  return (
    <div className={className}>
      <SkeletonLine className="h-4 w-20" />
      <SkeletonBlock className="mt-1 h-9.5 rounded-lg" />
      {hint && <SkeletonLine className="mt-1 h-[16.5px] w-56 max-w-full" />}
    </div>
  );
}

/** The form card: details, payment (its "Loading payment options…" line), terms and submit. */
function FormSkeleton() {
  return (
    <div className="mt-8 space-y-6 rounded-2xl border bg-card p-6">
      <div>
        <SkeletonLine className="mb-4 h-6 w-28" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
          <FieldSkeleton className="sm:col-span-2" hint />
        </div>
      </div>
      <div className="border-t pt-6">
        <SkeletonLine className="mb-4 h-6 w-24" />
        <SkeletonLine className="w-48" />
      </div>
      {/* The terms line wraps to two lines on phones */}
      <div>
        <SkeletonLine className="w-80 max-w-full" />
        <SkeletonLine className="w-32 sm:hidden" />
      </div>
      <SkeletonBlock className="h-12 rounded-lg" />
    </div>
  );
}

/** "Your booking": ground photo and name, date / time / sport, then the price lines. */
function SummarySkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <SkeletonLine className="mb-3 h-6 w-28" />
      <div className="flex gap-3">
        <SkeletonBlock className="h-20 w-20 shrink-0 rounded-lg" />
        <div className="flex-1">
          <SkeletonBlock className="h-5 w-14 rounded-md" />
          <SkeletonLine className="mt-1 h-6 w-32" />
          <SkeletonLine className="h-4 w-40 max-w-full" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => <SummaryRowSkeleton key={i} />)}
      </div>
      <div className="mt-4 space-y-1.5 border-t pt-4">
        <SummaryRowSkeleton />
        <SummaryRowSkeleton />
        <div className="flex justify-between border-t pt-2">
          <SkeletonLine className="h-6 w-12" />
          <SkeletonLine className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

function SummaryRowSkeleton() {
  return (
    <div className="flex justify-between">
      <SkeletonLine className="w-16" />
      <SkeletonLine className="w-24" />
    </div>
  );
}
