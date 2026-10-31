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
export function RailNavItem({
  item,
  pathname,
  showMenu,
  selectOnly = false,
  touch = false,
  selected = false,
  onHover,
  onNavClick,
}: {
  item: NavItem;
  pathname: string;
  showMenu: boolean;
  /** Drawer on a phone or tablet: no hover tooltips. */
  touch?: boolean;
  /** Its section is the one shown in the panel (a tap in the drawer). */
  selected?: boolean;
  /** Touch drawer: a tap shows the section's sub-pages in the panel instead of opening the page. */
  selectOnly?: boolean;
  onHover?: () => void;
  onNavClick?: () => void;
}) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const children = showMenu ? (item.children ?? []) : [];

  const link = (
    <Link
      href={item.href}
      onClick={(e) => {
        if (selectOnly) {
          e.preventDefault();
          onHover?.();
          return;
        }
        onNavClick?.();
      }}
      onMouseEnter={onHover}
      onFocus={onHover}
      className={cn(
        "relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200",
        isActive
          ? cn("shadow-sm ring-1 ring-current/30", item.color)
          : selected
            ? "bg-sidebar-accent text-sidebar-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:scale-105"
      )}
      style={
        isActive
          ? { backgroundColor: "color-mix(in oklab, currentColor 18%, transparent)" }
          : undefined
      }
    >
      <item.icon className={cn("h-[18px] w-[18px]", isActive && item.color)} />
      {isActive && (
        <span
          aria-hidden
          className={cn(
            "absolute top-1/2 -left-[11px] h-6 w-1 -translate-y-1/2 rounded-r-full bg-current shadow-[0_0_10px_currentColor]",
            item.color
          )}
        />
      )}
    </Link>
  );
  // Touch drawer: a tap shows the section in the panel, so a tooltip would only get in the way.
  if (selectOnly || touch) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>

      {children.length === 0 ? (
        <TooltipContent side="right" sideOffset={10} className="font-medium">
          {item.label}
        </TooltipContent>
      ) : (
        <TooltipContent
          side="right"
          align="start"
          sideOffset={10}
          className="w-56 rounded-xl p-1.5 shadow-lg"
        >
          <div className="flex items-center gap-2 px-2 pt-1.5 pb-2">
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
                    childActive
                      ? cn("font-semibold", item.color)
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                  style={
                    childActive
                      ? { backgroundColor: "color-mix(in oklab, currentColor 12%, transparent)" }
                      : undefined
                  }
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
