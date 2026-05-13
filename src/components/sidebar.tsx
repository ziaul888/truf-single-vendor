"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X, LogOut, PanelLeftClose, PanelLeftOpen, ChevronsUpDown, User, Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV } from "./sidebar-nav-data";

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
  onClose?: () => void;
}

const USER = { name: "Nipon", email: "nipon@6amtech.com", initial: "N" };

export function Sidebar({ collapsed, onCollapse, onClose }: SidebarProps) {
  const pathname = usePathname();

  const allItems = NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })));
  const activeItem =
    allItems
      .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
      .sort((a, b) => b.href.length - a.href.length)[0] ?? allItems[0];

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex h-screen overflow-hidden bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out border-r border-sidebar-border",
          collapsed ? "w-18" : "w-72",
        )}
      >
        {/* ─── Ambient brand glows ─── */}
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-32 -z-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl dark:bg-primary/20" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-16 -z-10 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

        {/* ═══ RAIL ═══ */}
        <div className="relative flex w-18 shrink-0 flex-col items-center border-r border-sidebar-border/70 bg-sidebar-accent/20 py-3 backdrop-blur-sm">
          {/* Brand */}
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-primary via-primary to-primary/60 shadow-lg ring-1 ring-primary/40">
              <span className="text-base font-black tracking-tight text-primary-foreground">T</span>
            </div>
            <span aria-hidden className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_8px_var(--color-success)] ring-2 ring-sidebar" />
            </span>
          </div>

          <div className="my-3 h-px w-9 bg-linear-to-r from-transparent via-sidebar-border to-transparent" />

          {/* Rail nav */}
          <nav className="scrollbar-hover flex-1 w-full space-y-1.5 overflow-y-auto px-2.5">
            {NAV.map((group, gi) => (
              <div key={group.label}>
                {gi > 0 && <div className="my-2 mx-1 h-px bg-sidebar-border/50" />}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200",
                              isActive
                                ? cn("ring-1 ring-current/30 shadow-sm", item.color)
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:scale-105 hover:text-sidebar-foreground",
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
                                  "absolute -left-[11px] top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-current shadow-[0_0_10px_currentColor]",
                                  item.color,
                                )}
                              />
                            )}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Collapse toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onCollapse(!collapsed)}
                className="mt-2 hidden h-10 w-10 items-center justify-center rounded-xl text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:flex"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
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
              key={`hdr-${activeItem.href}`}
              className="relative flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/70 px-4 animate-in fade-in slide-in-from-left-1 duration-300"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/45">
                  <span className={cn("h-1 w-1 rounded-full bg-current", activeItem.color)} />
                  <span className="truncate">{activeItem.group}</span>
                </div>
                <div className="mt-0.5 flex items-baseline gap-2">
                  <p className={cn("truncate text-[17px] font-bold tracking-tight leading-tight", activeItem.color)}>
                    {activeItem.label}
                  </p>
                  {activeItem.children && activeItem.children.length > 0 && (
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-1.5 py-px text-[10px] font-bold tracking-wider",
                        activeItem.color,
                      )}
                      style={{
                        backgroundColor: "color-mix(in oklab, currentColor 15%, transparent)",
                      }}
                    >
                      {activeItem.children.length}
                    </span>
                  )}
                </div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {/* Accent strip */}
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute bottom-0 left-4 right-4 h-px bg-linear-to-r from-current via-current/40 to-transparent",
                  activeItem.color,
                )}
              />
            </div>

            {/* Section children */}
            <nav
              key={`body-${activeItem.href}`}
              className="scrollbar-hover flex-1 overflow-y-auto px-3 py-4 animate-in fade-in slide-in-from-left-2 duration-300"
            >
              {activeItem.children && activeItem.children.length > 0 ? (
                <ul className="space-y-1">
                  {activeItem.children.map((child) => {
                    const childActive = pathname === child.href;
                    return (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={onClose}
                          className={cn(
                            "group/sub relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                            childActive
                              ? cn("font-semibold shadow-sm ring-1 ring-current/20", activeItem.color)
                              : "font-medium text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground hover:translate-x-0.5",
                          )}
                          style={
                            childActive
                              ? { backgroundColor: "color-mix(in oklab, currentColor 14%, transparent)" }
                              : undefined
                          }
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-200",
                              childActive
                                ? "bg-current shadow-[0_0_8px_currentColor] scale-110"
                                : "bg-sidebar-foreground/25 group-hover/sub:bg-sidebar-foreground/50",
                            )}
                          />
                          <child.icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-transform duration-200 group-hover/sub:scale-110",
                              childActive
                                ? ""
                                : "text-sidebar-foreground/55 group-hover/sub:text-sidebar-foreground",
                            )}
                          />
                          <span className="flex-1 truncate text-[13.5px]">{child.label}</span>
                          <ChevronRight
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 transition-all duration-200",
                              childActive
                                ? "opacity-100 translate-x-0"
                                : "opacity-0 -translate-x-1 text-sidebar-foreground/40 group-hover/sub:opacity-100 group-hover/sub:translate-x-0",
                            )}
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sidebar-border/80 bg-sidebar-accent/15 p-6 text-center">
                  <div
                    className={cn(
                      "mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-current/30",
                      activeItem.color,
                    )}
                    style={{ backgroundColor: "color-mix(in oklab, currentColor 14%, transparent)" }}
                  >
                    <activeItem.icon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-sidebar-foreground">
                    {activeItem.label}
                  </p>
                  <p className="mt-1 text-[11px] text-sidebar-foreground/55">
                    Single page · no subsections
                  </p>
                </div>
              )}
            </nav>

            {/* User card */}
            <div className="shrink-0 border-t border-sidebar-border/70 p-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="group flex w-full items-center gap-3 rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/30 p-2.5 text-left transition-all hover:bg-sidebar-accent/60 hover:border-sidebar-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-sidebar-accent/70"
                    aria-label="Account menu"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-9 w-9 ring-2 ring-primary/30">
                        <AvatarFallback className="bg-linear-to-br from-primary to-primary/60 text-xs font-bold text-primary-foreground">
                          {USER.initial}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        aria-hidden
                        className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_6px_var(--color-success)] ring-2 ring-sidebar"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-[13px] font-semibold text-sidebar-foreground">
                          {USER.name}
                        </p>
                        <span className="rounded-full bg-success/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-success">
                          Admin
                        </span>
                      </div>
                      <p className="truncate text-[10px] text-sidebar-foreground/60">{USER.email}</p>
                    </div>
                    <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" sideOffset={8} className="w-56">
                  <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                        {USER.initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{USER.name}</p>
                      <p className="truncate text-[10px] font-normal text-muted-foreground">
                        {USER.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2">
                    <User className="h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <Settings className="h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
