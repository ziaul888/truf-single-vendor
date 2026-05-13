"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { NavItem } from "./sidebar-nav-data";

const ROW_BASE =
  "group relative flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-sm transition-all duration-200";
const ROW_ACTIVE = "bg-sidebar-accent/70 backdrop-blur-sm shadow-sm";
const ROW_IDLE =
  "hover:bg-sidebar-accent/30";

function IconChip({
  Icon, color, isActive,
}: { Icon: NavItem["icon"]; color: string; isActive: boolean }) {
  return (
    <span
      className={cn(
        "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
        isActive
          ? cn("ring-1 ring-current/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]", color)
          : "bg-sidebar-accent/40 group-hover:scale-105",
      )}
      style={isActive ? { backgroundColor: "color-mix(in oklab, currentColor 18%, transparent)" } : undefined}
    >
      <Icon
        className={cn(
          "h-[17px] w-[17px] transition-colors",
          isActive ? "" : cn("text-sidebar-foreground/70 group-hover:text-current", color),
        )}
      />
    </span>
  );
}

export function NavItemRow({ item, collapsed, pathname, onNavClick }: {
  item: NavItem; collapsed: boolean; pathname: string; onNavClick?: () => void;
}) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const [open, setOpen] = useState(isActive);
  const hasChildren = !!item.children?.length;

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "relative mx-auto flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200",
              isActive
                ? cn("ring-1 ring-current/30 shadow-sm", item.color)
                : "text-sidebar-foreground/85 hover:bg-sidebar-accent/40 hover:scale-105",
            )}
            style={isActive ? { backgroundColor: "color-mix(in oklab, currentColor 18%, transparent)" } : undefined}
          >
            <item.icon className={cn("h-[18px] w-[18px] transition-colors", isActive && item.color)} />
            {isActive && (
              <span
                aria-hidden
                className={cn(
                  "absolute -right-1 top-1.5 h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]",
                  item.color,
                )}
              />
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
          {hasChildren && (
            <div className="mt-1.5 space-y-1 border-t border-border/50 pt-1.5">
              {item.children!.map((c) => (
                <Link key={c.href} href={c.href} className="block text-xs text-muted-foreground hover:text-foreground">
                  {c.label}
                </Link>
              ))}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!hasChildren) {
    return (
      <Link
        href={item.href}
        onClick={onNavClick}
        className={cn(ROW_BASE, isActive ? ROW_ACTIVE : ROW_IDLE)}
      >
        <IconChip Icon={item.icon} color={item.color} isActive={isActive} />
        <span
          className={cn(
            "flex-1 truncate transition-colors",
            isActive
              ? "font-semibold text-sidebar-foreground"
              : "font-medium text-sidebar-foreground/80 group-hover:text-sidebar-foreground",
          )}
        >
          {item.label}
        </span>
        {isActive && (
          <span
            aria-hidden
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]",
              item.color,
            )}
          />
        )}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(ROW_BASE, isActive ? ROW_ACTIVE : ROW_IDLE, "text-left")}
      >
        <IconChip Icon={item.icon} color={item.color} isActive={isActive} />
        <span
          className={cn(
            "flex-1 truncate transition-colors",
            isActive
              ? "font-semibold text-sidebar-foreground"
              : "font-medium text-sidebar-foreground/80 group-hover:text-sidebar-foreground",
          )}
        >
          {item.label}
        </span>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-sidebar-foreground/60 transition-transform duration-200",
            open && "rotate-90",
          )}
        />
      </button>

      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0">
          <div
            className={cn(
              "ml-6 mt-1 space-y-0.5 border-l border-current/25 pl-3.5 pb-1",
              item.color,
            )}
          >
            {item.children!.map((child) => {
              const childActive = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onNavClick}
                  className={cn(
                    "group/sub relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-all duration-150",
                    childActive
                      ? "bg-sidebar-accent/60 font-semibold text-sidebar-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground hover:translate-x-0.5",
                  )}
                >
                  {childActive && (
                    <span
                      aria-hidden
                      className="absolute -left-[14.5px] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-current shadow-[0_0_6px_currentColor]"
                    />
                  )}
                  <child.icon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      childActive ? "" : "text-sidebar-foreground/50 group-hover/sub:text-current",
                    )}
                  />
                  <span className="truncate">{child.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
