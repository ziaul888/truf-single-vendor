"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface FilterMenuProps {
  /** How many filters are set; shown as a badge on the icon. */
  activeCount: number;
  contentClassName?: string;
  children: React.ReactNode;
}

/**
 * Below md, collapses a page's filters into a filter icon with a dropdown. From md up the
 * children render inline, as direct children of the parent's flex or grid layout.
 */
export function FilterMenu({ activeCount, contentClassName, children }: FilterMenuProps) {
  return (
    <>
      <div className="shrink-0 md:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative"
              aria-label={activeCount > 0 ? `Filters, ${activeCount} active` : "Filters"}
            >
              <Filter className="h-4 w-4" />
              {activeCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            collisionPadding={16}
            // Focus the panel rather than its first filter, whose focus ring reads like an error.
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              (e.currentTarget as HTMLElement).focus();
            }}
            className={cn("flex w-64 flex-col gap-2 *:w-full!", contentClassName)}
          >
            {children}
          </PopoverContent>
        </Popover>
      </div>
      <div className="hidden md:contents">{children}</div>
    </>
  );
}
