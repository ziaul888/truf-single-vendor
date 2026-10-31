"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { NavItem } from "./sidebar-nav-data";

/**
 * A rail icon. With the panel open, hovering previews the section in the panel
 * (`onHover`) and the tooltip shows just the label. With the sidebar collapsed,
 * hovering opens a box on its right with the section's sub-pages (it stays open
 * while the pointer moves into it, so the links are clickable).
 */
export function RailNavItem({ item, pathname, showMenu, onHover, onNavClick }: {
  item: NavItem; pathname: string; showMenu: boolean; onHover?: () => void; onNavClick?: () => void;
}) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const children = showMenu ? item.children ?? [] : [];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={item.href}
          onClick={onNavClick}
          onMouseEnter={onHover}
          onFocus={onHover}
          className={cn(
            "relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200",
            isActive
              ? cn("ring-1 ring-current/30 shadow-sm", item.color)
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:scale-105 hover:text-sidebar-foreground",
          )}
          style={isActive ? { backgroundColor: "color-mix(in oklab, currentColor 18%, transparent)" } : undefined}
        >
          <item.icon className={cn("h-[18px] w-[18px]", isActive && item.color)} />
          {isActive && (
            <span
              aria-hidden
              className={cn(
                "absolute -left-[11px] top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-current shadow-[0_0_10px_currentColor]",
                item.color,
              )}
            />
          )}
        </Link>
      </TooltipTrigger>

      {children.length === 0 ? (
        <TooltipContent side="right" sideOffset={10} className="font-medium">{item.label}</TooltipContent>
      ) : (
        <TooltipContent side="right" align="start" sideOffset={10} className="w-56 rounded-xl p-1.5 shadow-lg">
          <div className="flex items-center gap-2 px-2 pb-2 pt-1.5">
            <span
              className={cn("flex h-6 w-6 items-center justify-center rounded-lg", item.color)}
              style={{ backgroundColor: "color-mix(in oklab, currentColor 15%, transparent)" }}
            >
              <item.icon className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm font-semibold">{item.label}</span>
          </div>
          <div className="space-y-0.5 border-t pt-1.5">
            {children.map((child) => {
              const childActive = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onNavClick}
                  className={cn(
                    "group/fly flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] transition-colors",
                    childActive ? cn("font-semibold", item.color) : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                  style={childActive ? { backgroundColor: "color-mix(in oklab, currentColor 12%, transparent)" } : undefined}
                >
                  <child.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 truncate">{child.label}</span>
                  <ChevronRight className="h-3 w-3 opacity-0 transition-opacity group-hover/fly:opacity-60" />
                </Link>
              );
            })}
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
