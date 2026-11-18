"use client";

import Link from "next/link";
import { LogOut, ChevronsUpDown, User, Settings, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMe } from "@/hooks/useMe";
import { useLogout } from "@/hooks/useLogout";
import type { DashboardAudience } from "@/hooks/useMe";

const ROLE_LABEL = { admin: "Admin", manager: "Manager", owner: "Admin" } as const;

export function SidebarUserMenu({ audience = "staff" }: { audience?: DashboardAudience }) {
  const { data: me } = useMe(audience);
  const { logout, loggingOut } = useLogout(audience);

  const name = me?.name ?? "…";
  const email = me?.email ?? "";
  const initial = me?.name.charAt(0).toUpperCase() ?? "";

  return (
    <div className="border-sidebar-border/70 shrink-0 border-t p-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="group border-sidebar-border/60 bg-sidebar-accent/30 hover:bg-sidebar-accent/60 hover:border-sidebar-border focus-visible:ring-ring data-[state=open]:bg-sidebar-accent/70 flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-all focus:outline-none focus-visible:ring-2"
            aria-label="Account menu"
          >
            <div className="relative shrink-0">
              <Avatar className="ring-primary/30 h-9 w-9 ring-2">
                <AvatarFallback className="from-primary to-primary/60 text-primary-foreground bg-linear-to-br text-xs font-bold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <span
                aria-hidden
                className="bg-success ring-sidebar absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full shadow-[0_0_6px_var(--color-success)] ring-2"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sidebar-foreground truncate text-[13px] font-semibold">{name}</p>
                {me && (
                  <span className="bg-success/15 text-success rounded-full px-1.5 py-px text-[9px] font-bold tracking-wider uppercase">
                    {ROLE_LABEL[me.role]}
                  </span>
                )}
              </div>
              <p className="text-sidebar-foreground/60 truncate text-[10px]">{email}</p>
            </div>
            <ChevronsUpDown className="text-sidebar-foreground/50 h-3.5 w-3.5 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="end" sideOffset={8} className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2.5 py-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{name}</p>
              <p className="text-muted-foreground truncate text-[10px] font-normal">{email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {audience === "staff" && (
            <>
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
            </>
          )}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive gap-2"
            disabled={loggingOut}
            onSelect={() => logout()}
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
