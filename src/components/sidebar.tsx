"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { X, PanelLeftClose, PanelLeftOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { navForRole } from "./sidebar-nav-data";
import { useMe } from "@/hooks/useMe";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarUserMenu } from "./sidebar-user-menu";
import { RailNavItem } from "./rail-nav-item";
import type { DashboardAudience } from "@/hooks/useMe";

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  /** Below lg the sidebar is a drawer: tapping a section with sub-pages shows them instead of navigating. */
  drawer?: boolean;
  onClose?: () => void;
  audience?: DashboardAudience;
}

export function Sidebar({
  collapsed,
  onCollapse,
  drawer = false,
  onClose,
  audience = "staff",
}: SidebarProps) {
  const pathname = usePathname();

  const { data: me } = useMe(audience);
  const nav = navForRole(audience === "owner" ? "owner" : me?.role);

  const allItems = nav.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })));
  const activeItem =
    allItems
      .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
      .sort((a, b) => b.href.length - a.href.length)[0] ?? allItems[0];
  // Hovering (or, in the drawer, tapping) a rail icon shows that section in the panel.
  // Leaving the sidebar, or navigating anywhere, goes back to the current section.
  const [preview, setPreview] = useState<{ href: string; path: string } | null>(null);
  const previewed = preview?.path === pathname ? preview.href : null;
  const panelItem = allItems.find((i) => i.href === previewed) ?? activeItem;
  const showSection = (href: string | null) => setPreview(href ? { href, path: pathname } : null);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        onMouseLeave={() => {
          if (!drawer) showSection(null);
        }}
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border relative flex h-dvh overflow-hidden border-r pt-[env(safe-area-inset-top)] transition-all duration-300 ease-in-out",
          collapsed ? "w-18" : drawer ? "w-[min(20rem,88vw)]" : "w-72"
        )}
      >
        {/* ─── Ambient brand glows ─── */}
        <div
          aria-hidden
          className="bg-primary/15 dark:bg-primary/20 pointer-events-none absolute -top-32 -left-24 -z-10 h-72 w-72 rounded-full blur-3xl"
        />
        <div
          aria-hidden
          className="bg-accent/15 pointer-events-none absolute -right-16 -bottom-32 -z-10 h-72 w-72 rounded-full blur-3xl"
        />

        {/* ═══ RAIL ═══ */}
        <div className="border-sidebar-border/70 bg-sidebar-accent/20 relative flex w-18 shrink-0 flex-col items-center border-r py-3 backdrop-blur-sm">
          {/* Brand */}
          <div className="relative">
            <SidebarBrand ownerName={audience === "owner" ? null : undefined} />
            <span aria-hidden className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="bg-success absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
              <span className="bg-success ring-sidebar relative inline-flex h-2.5 w-2.5 rounded-full shadow-[0_0_8px_var(--color-success)] ring-2" />
            </span>
          </div>

          <div className="via-sidebar-border my-3 h-px w-9 bg-linear-to-r from-transparent to-transparent" />

          {/* Rail nav */}
          <nav
            aria-label="Admin navigation"
            className="scrollbar-hover w-full flex-1 space-y-1.5 overflow-y-auto px-[13px] py-1"
          >
            {nav.map((group, gi) => (
              <div key={group.label}>
                {gi > 0 && <div className="bg-sidebar-border/50 mx-1 my-2 h-px" />}
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <RailNavItem
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      showMenu={collapsed}
                      onHover={() => showSection(item.href)}
                      selectOnly={drawer && !!item.children?.length}
                      touch={drawer}
                      selected={drawer && panelItem.href === item.href}
                      onNavClick={onClose}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Collapse toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onCollapse(!collapsed)}
                className="text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground mt-2 hidden h-10 w-10 items-center justify-center rounded-xl transition-colors lg:flex"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{collapsed ? "Expand" : "Collapse"}</TooltipContent>
          </Tooltip>
        </div>

        {/* ═══ PANEL ═══ */}
        {!collapsed && (
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Section header */}
            <div
              key={`hdr-${panelItem.href}`}
              className="border-sidebar-border/70 animate-in fade-in slide-in-from-left-1 relative flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 duration-300"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sidebar-foreground/45 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] uppercase">
                  <span className={cn("h-1 w-1 rounded-full bg-current", panelItem.color)} />
                  <span className="truncate">{panelItem.group}</span>
                </div>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <p
                    className={cn(
                      "truncate text-[17px] leading-tight font-bold tracking-tight",
                      panelItem.color
                    )}
                  >
                    {panelItem.label}
                  </p>
                  {panelItem.children && panelItem.children.length > 0 && (
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-1.5 py-px text-[10px] font-bold tracking-wider",
                        panelItem.color
                      )}
                      style={{
                        backgroundColor: "color-mix(in oklab, currentColor 15%, transparent)",
                      }}
                    >
                      {panelItem.children.length}
                    </span>
                  )}
                </div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-lg p-1.5 transition-colors lg:hidden"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {/* Accent strip */}
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute right-4 bottom-0 left-4 h-px bg-linear-to-r from-current via-current/40 to-transparent",
                  panelItem.color
                )}
              />
            </div>

            {/* Section children */}
            <nav
              aria-label={`${panelItem.label} pages`}
              key={`body-${panelItem.href}`}
              className="scrollbar-hover animate-in fade-in slide-in-from-left-2 flex-1 overflow-y-auto px-3 py-4 duration-300"
            >
              {panelItem.children && panelItem.children.length > 0 ? (
                <ul className="space-y-1">
                  {panelItem.children.map((child) => {
                    const childActive = pathname === child.href;
                    return (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={onClose}
                          aria-current={childActive ? "page" : undefined}
                          className={cn(
                            "group/sub relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                            childActive
                              ? cn(
                                  "font-semibold shadow-sm ring-1 ring-current/20",
                                  panelItem.color
                                )
                              : "text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground font-medium hover:translate-x-0.5"
                          )}
                          style={
                            childActive
                              ? {
                                  backgroundColor:
                                    "color-mix(in oklab, currentColor 14%, transparent)",
                                }
                              : undefined
                          }
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200",
                              childActive
                                ? "scale-110 bg-current shadow-[0_0_8px_currentColor]"
                                : "bg-sidebar-foreground/25 group-hover/sub:bg-sidebar-foreground/50"
                            )}
                          />
                          <child.icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-transform duration-200 group-hover/sub:scale-110",
                              childActive
                                ? ""
                                : "text-sidebar-foreground/55 group-hover/sub:text-sidebar-foreground"
                            )}
                          />
                          <span className="flex-1 truncate text-[13.5px]">{child.label}</span>
                          <ChevronRight
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 transition-all duration-200",
                              childActive
                                ? "translate-x-0 opacity-100"
                                : "text-sidebar-foreground/40 -translate-x-1 opacity-0 group-hover/sub:translate-x-0 group-hover/sub:opacity-100"
                            )}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="border-sidebar-border/80 bg-sidebar-accent/15 flex flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center">
                  <div
                    className={cn(
                      "mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-current/30",
                      panelItem.color
                    )}
                    style={{
                      backgroundColor: "color-mix(in oklab, currentColor 14%, transparent)",
                    }}
                  >
                    <panelItem.icon className="h-6 w-6" />
                  </div>
                  <p className="text-sidebar-foreground text-sm font-semibold">{panelItem.label}</p>
                  <p className="text-sidebar-foreground/55 mt-1 text-[11px]">
                    Single page · no subsections
                  </p>
                </div>
              )}
            </nav>

            <SidebarUserMenu audience={audience} />
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
