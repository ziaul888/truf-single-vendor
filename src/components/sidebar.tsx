"use client";

import { usePathname } from "next/navigation";
import { X, LogOut, PanelLeftClose, PanelLeftOpen, ChevronsUpDown, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavItemRow } from "./nav-item-row";
import { NAV } from "./sidebar-nav-data";

interface SidebarProps { collapsed: boolean; onCollapse: (v: boolean) => void; onClose?: () => void }

const USER = { name: "Nipon", email: "nipon@6amtech.com", initial: "N" };

export function Sidebar({ collapsed, onCollapse, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        "relative flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
        "border-r border-sidebar-border",
        collapsed ? "w-16" : "w-[270px]"
      )}>
        {/* Logo / brand */}
        <div className={cn(
          "flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-3",
          collapsed && "justify-center px-0"
        )}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary shadow-sm">
            <span className="text-sm font-bold text-primary-foreground">T</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight text-sidebar-foreground">Turf Admin</p>
              <p className="truncate text-[11px] text-sidebar-foreground/65">Sports Management</p>
            </div>
          )}
          {!collapsed && onClose && (
            <button
              onClick={onClose}
              className="rounded-md p-1 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="scrollbar-hover flex-1 overflow-y-auto px-2 py-3">
          {NAV.map((group, gi) => (
            <div key={group.label} className={cn(gi > 0 && "mt-4")}>
              {!collapsed ? (
                <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                  {group.label}
                </p>
              ) : (
                gi > 0 && <div className="mx-3 mb-2 h-px bg-sidebar-border" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItemRow
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    pathname={pathname}
                    onNavClick={onClose}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer — user dropdown + collapse toggle */}
        <div className={cn("shrink-0 border-t border-sidebar-border p-2", collapsed && "px-1.5")}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-sidebar-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-sidebar-accent",
                  collapsed && "justify-center"
                )}
                aria-label="Account menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-sidebar-primary/15 text-xs font-semibold text-sidebar-primary">
                    {USER.initial}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-sidebar-foreground">{USER.name}</p>
                      <p className="truncate text-[10px] text-sidebar-foreground/70">{USER.email}</p>
                    </div>
                    <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/60" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={collapsed ? "right" : "top"}
              align={collapsed ? "start" : "end"}
              sideOffset={8}
              className="w-56"
            >
              <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                    {USER.initial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{USER.name}</p>
                  <p className="truncate text-[10px] font-normal text-muted-foreground">{USER.email}</p>
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

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onCollapse(!collapsed)}
                className={cn(
                  "mt-1 hidden w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:flex",
                  collapsed && "justify-center"
                )}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed
                  ? <PanelLeftOpen className="h-4 w-4" />
                  : <><PanelLeftClose className="h-4 w-4" /><span>Collapse</span></>}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Expand sidebar</TooltipContent>}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
