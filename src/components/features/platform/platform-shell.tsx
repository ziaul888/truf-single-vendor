"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Layers3,
  LayoutDashboard,
  Building2,
  LogOut,
  Menu,
  ShieldCheck,
  CreditCard,
  Repeat2,
  FileText,
  ClipboardList,
} from "lucide-react";
import { usePlatformApplications, usePlatformMe } from "@/hooks/usePlatform";
import { platformApi } from "@/lib/platform-api";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { PlatformLoading, PlatformReadError } from "./platform-states";

function PlatformNavigation({
  onNavigate,
  pendingApplications = 0,
}: {
  onNavigate?: () => void;
  pendingApplications?: number;
}) {
  const path = usePathname();
  return (
    <nav aria-label="Platform navigation" className="space-y-1.5">
      {[
        { href: "/platform", label: "Overview", Icon: LayoutDashboard },
        { href: "/platform/applications", label: "Applications", Icon: ClipboardList },
        { href: "/platform/tenants", label: "Turf businesses", Icon: Building2 },
        { href: "/platform/plans", label: "Plans", Icon: CreditCard },
        { href: "/platform/subscriptions", label: "Subscriptions", Icon: Repeat2 },
        { href: "/platform/invoices", label: "Invoices", Icon: FileText },
      ].map(({ href, label, Icon }) => {
        const active = href === "/platform" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "focus-visible:ring-sidebar-ring flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
            {href === "/platform/applications" && pendingApplications > 0 && (
              <span className="bg-warning text-warning-foreground ml-auto min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-bold tabular-nums">
                {pendingApplications > 99 ? "99+" : pendingApplications}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function PlatformBrand() {
  return (
    <Link
      href="/platform"
      className="focus-visible:ring-sidebar-ring flex min-h-12 items-center gap-3 rounded-xl outline-none focus-visible:ring-2"
    >
      <span className="bg-sidebar-primary text-sidebar-primary-foreground flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
        <Layers3 className="h-6 w-6" />
      </span>
      <div>
        <p className="font-semibold tracking-tight">SaaS Admin</p>
        <p className="text-sidebar-foreground/55 mt-0.5 text-xs">Platform administration</p>
      </div>
    </Link>
  );
}

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const user = usePlatformMe(),
    router = useRouter(),
    queryClient = useQueryClient();
  const pendingApplications = usePlatformApplications(user.data?.id, {
    page: 1,
    limit: 1,
    status: "pending",
  });
  const [open, setOpen] = useState(false),
    [signingOut, setSigningOut] = useState(false),
    [signOutError, setSignOutError] = useState("");
  async function logout() {
    setSigningOut(true);
    setSignOutError("");
    try {
      await platformApi.post("/auth/logout");
      await queryClient.cancelQueries();
      queryClient.clear();
      router.push("/platform/login");
      router.refresh();
    } catch {
      setSignOutError("Sign out failed. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <a
        href="#platform-content"
        className="focus:bg-card sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-lg focus:p-3"
      >
        Skip to content
      </a>
      <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border fixed inset-y-0 left-0 hidden w-64 flex-col border-r p-5 lg:flex">
        <PlatformBrand />
        <p className="text-sidebar-foreground/40 mt-10 mb-3 px-4 text-[11px] font-semibold tracking-widest uppercase">
          Manage platform
        </p>
        <PlatformNavigation pendingApplications={pendingApplications.data?.total} />
        <div className="text-sidebar-foreground/55 border-sidebar-border mt-auto border-t px-3 pt-5 text-xs leading-relaxed">
          <ShieldCheck className="text-sidebar-primary mb-2 h-5 w-5" />
          Platform administrator access
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="bg-card/95 sticky top-0 z-30 border-b pt-[env(safe-area-inset-top)] backdrop-blur">
          <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-3 px-4 sm:px-7">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="lg:hidden">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-11 w-11 p-0"
                      aria-label="Open platform menu"
                    >
                      <Menu />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-sidebar text-sidebar-foreground max-w-xs [&>button]:h-11 [&>button]:w-11">
                    <SheetHeader className="border-sidebar-border pr-16">
                      <SheetTitle className="text-sidebar-foreground">SaaS Admin</SheetTitle>
                      <SheetDescription className="text-sidebar-foreground/60">
                        Platform administration
                      </SheetDescription>
                    </SheetHeader>
                    <div className="p-5">
                      <PlatformNavigation
                        pendingApplications={pendingApplications.data?.total}
                        onNavigate={() => setOpen(false)}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Platform console</p>
                <p className="text-muted-foreground truncate text-xs">
                  {user.data?.name ?? "SaaS Admin"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-3">
              <div className="[&_button]:h-11 [&_button]:w-11">
                <ThemeToggle />
              </div>
              <Button
                variant="ghost"
                className="h-11 gap-2 px-3"
                onClick={logout}
                disabled={signingOut}
                aria-label="Sign out of platform"
              >
                <LogOut />
                <span className="hidden sm:inline">{signingOut ? "Signing out…" : "Sign out"}</span>
              </Button>
            </div>
          </div>
        </header>
        <main
          id="platform-content"
          tabIndex={-1}
          className="mx-auto max-w-7xl px-4 py-7 outline-none sm:px-7 sm:py-9"
        >
          {signOutError && (
            <p role="alert" className="text-destructive mb-5 text-sm">
              {signOutError}
            </p>
          )}
          {user.isError ? (
            <PlatformReadError error={user.error} onRetry={() => user.refetch()} />
          ) : user.isPending ? (
            <PlatformLoading label="Checking platform access" />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
