"use client";

import Link from "next/link";
import { LogOut, ChevronsUpDown, User, Settings, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMe } from "@/hooks/useMe";
import { useLogout } from "@/hooks/useLogout";

const ROLE_LABEL = { admin: "Admin", manager: "Manager" } as const;

export function SidebarUserMenu() {
  const { data: me } = useMe();
  const { logout, loggingOut } = useLogout();

  const name = me?.name ?? "…";
  const email = me?.email ?? "";
  const initial = me?.name.charAt(0).toUpperCase() ?? "";

  return (
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
                  {initial}
                </AvatarFallback>
              </Avatar>
              <span
                aria-hidden
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_6px_var(--color-success)] ring-2 ring-sidebar"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[13px] font-semibold text-sidebar-foreground">{name}</p>
                {me && (
                  <span className="rounded-full bg-success/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-success">
                    {ROLE_LABEL[me.role]}
                  </span>
                )}
              </div>
              <p className="truncate text-[10px] text-sidebar-foreground/60">{email}</p>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" sideOffset={8} className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{name}</p>
              <p className="truncate text-[10px] font-normal text-muted-foreground">{email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild className="gap-2">
            <Link href="/dashboard/profile">
              <User className="h-4 w-4" /> Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="gap-2">
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-destructive focus:text-destructive"
            disabled={loggingOut}
            onSelect={() => logout()}
          >
            {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
