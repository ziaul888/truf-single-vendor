import { cn } from "@/lib/utils";

/**
 * Actions pinned to the bottom of the screen below lg, clear of the phone's home indicator.
 * The page needs bottom padding so its last content isn't hidden behind the bar.
 */
export function MobileActionBar({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-3 pt-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] backdrop-blur lg:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
