"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CalendarCog, Wallet, Bell, ShieldCheck, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { label: "General",       href: "/dashboard/settings/general",       icon: Building2,   desc: "Business, locale, branding" },
  { label: "Booking",       href: "/dashboard/settings/booking",       icon: CalendarCog, desc: "Rules, slots, pricing" },
  { label: "Payments",      href: "/dashboard/settings/payments",      icon: Wallet,      desc: "Gateway, invoices" },
  { label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell,        desc: "Email, alerts" },
  { label: "Access",        href: "/dashboard/settings/access",        icon: ShieldCheck, desc: "Users, roles" },
  { label: "System",        href: "/dashboard/settings/system",        icon: Database,    desc: "Backup, danger zone" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your platform configuration</p>
      </div>

      {/* Mobile: full-bleed horizontal scrollable tab strip */}
      <nav
        aria-label="Settings sections"
        className="-mx-6 overflow-x-auto border-b scrollbar-thin md:-mx-10 lg:hidden"
      >
        <ul className="flex w-max items-stretch gap-1 px-4 md:px-8">
          {SECTIONS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href} className="shrink-0">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-2 whitespace-nowrap rounded-t-md px-3 py-3 text-sm transition-colors",
                    active
                      ? "font-medium text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr] items-start">
        {/* Desktop sidebar nav */}
        <nav className="sticky top-6 hidden space-y-0.5 lg:block">
          {SECTIONS.map(({ label, href, icon: Icon, desc }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  active
                    ? "bg-primary/10 text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "")} />
                <div className="min-w-0">
                  <p className="truncate leading-tight">{label}</p>
                  <p className="truncate text-[10px] text-muted-foreground/70">{desc}</p>
                </div>
                {active && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </nav>

        {/* Page content */}
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
