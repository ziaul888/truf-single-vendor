import { SkeletonBlock } from "./skeleton-block";
import { SkeletonLine } from "./skeleton-line";

/** Sign in while it loads: centred title and intro, the phone form card, the note below. */
export function SignInSkeleton() {
  return (
    <div className="page-loading mx-auto max-w-md px-4 py-16 sm:px-6" aria-busy="true" aria-label="Loading sign in">
      <div className="flex flex-col items-center">
        <SkeletonLine className="h-9 w-32" />
        <SkeletonLine className="mt-2 w-full" />
        <SkeletonLine className="w-2/3" />
      </div>
      <div className="mt-8 space-y-4 rounded-2xl border bg-card p-6">
        <div>
          <SkeletonLine className="h-4 w-28" />
          <SkeletonBlock className="mt-1 h-11.5 rounded-lg" />
        </div>
        <SkeletonBlock className="h-11 rounded-lg" />
      </div>
      <div className="mt-6 flex flex-col items-center">
        <SkeletonLine className="h-4 w-full" />
        <SkeletonLine className="h-4 w-full" />
        <SkeletonLine className="h-4 w-1/2" />
      </div>
    </div>
  );
}
