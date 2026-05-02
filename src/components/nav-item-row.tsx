"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { NavItem } from "./sidebar-nav-data";

const ROW_BASE =
  "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors";
const ROW_ACTIVE = "bg-sidebar-accent text-sidebar-foreground";
const ROW_IDLE =
  "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground";

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
              "mx-auto flex h-9 w-9 items-center justify-center rounded-md transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            )}
          >
            <item.icon className={cn("h-[18px] w-[18px]", isActive && item.color)} />
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
        <item.icon
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            isActive ? item.color : "text-sidebar-foreground/75 group-hover:text-sidebar-foreground"
          )}
        />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(ROW_BASE, isActive ? ROW_ACTIVE : ROW_IDLE)}
      >
        <item.icon
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            isActive ? item.color : "text-sidebar-foreground/75 group-hover:text-sidebar-foreground"
          )}
        />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-sidebar-foreground/60 transition-transform duration-200",
            open && "rotate-90"
          )}
        />
      </button>

      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-200",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0">
          <div className="ml-[18px] mt-0.5 space-y-0.5 border-l border-sidebar-border pl-3 pb-1">
            {item.children!.map((child) => {
              const childActive = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onNavClick}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    childActive
                      ? "bg-sidebar-accent font-medium text-sidebar-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  <child.icon
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      childActive ? item.color : "text-sidebar-foreground/65"
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
