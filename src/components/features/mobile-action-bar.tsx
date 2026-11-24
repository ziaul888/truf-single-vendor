import { cn } from "@/lib/utils";

/**
 * Put the bar last in the page or form. Sticky positioning reserves its actual height
 * in the scroll area, including when its actions wrap or require a second row.
 */
export function MobileActionBar({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      data-mobile-action-bar
      className={cn(
        "sticky bottom-0 z-20 -ml-(--dashboard-left) -mr-(--dashboard-right) border-t bg-card pl-(--dashboard-left) pr-(--dashboard-right) pt-3 pb-[calc(0.75rem+var(--dashboard-bottom))] lg:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
