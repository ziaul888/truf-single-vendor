"use client";

import { PortalLink as Link, useTurfPortal } from "@/components/portal/turf-portal-scope";
import { turfPortalPath } from "@/lib/turf-portal-path";
import { usePathname } from "next/navigation";
import { CalendarDays, House, Trophy, UserRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCustomerSession } from "@/components/portal/account/use-customer-session";
import { CustomerSignInLink } from "@/components/portal/account/customer-sign-in-dialog";

interface Tab {
  href: string;
  label: string;
  Icon: LucideIcon;
  active: boolean;
  bookingAction?: boolean;
  signIn?: boolean;
}

/**
 * Phones only: the app-style tab bar pinned to the bottom of the portal.
 * `data-portal-tabs` lets the layout hide it while a page's own fixed action bar
 * (`data-mobile-cta`) is on screen. The spacer keeps the footer clear of the bar.
 * Checkout has its own submit button, so the bar stays off there.
 */
export function PortalTabBar({ bookHref }: { bookHref: string }) {
  const portal = useTurfPortal();
  const slug = portal?.slug;
  const fullPath = usePathname();
  const base = turfPortalPath(slug);
  const inTurf = slug && (fullPath === base || fullPath.startsWith(base + "/"));
  const pathname = fullPath === portal?.homePath ? "/" : inTurf ? fullPath.slice(base.length) : fullPath;
  const tabs = useTabs(pathname, bookHref);
  if (pathname.startsWith("/checkout")) return null;

  return (
    <div data-portal-tabs className="md:hidden">
      <div aria-hidden className="h-[calc(var(--portal-tabs-height)+1px+env(safe-area-inset-bottom))] bg-sidebar" />
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 select-none border-t border-white/10 bg-sidebar/95 pb-[env(safe-area-inset-bottom)] text-sidebar-foreground backdrop-blur"
      >
        <ul className="grid h-(--portal-tabs-height) grid-cols-4">
          {tabs.map(({ href, label, Icon, active, bookingAction, signIn }) => {
            const TabLink = signIn ? CustomerSignInLink : Link;
            return (
              <li key={label}>
                <TabLink
                  href={href}
                  data-football-kick={bookingAction}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-full min-h-11 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-transform active:scale-95",
                    active ? "text-accent" : "opacity-70",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                  {label}
                </TabLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

/** The Account tab opens sign-in over the current page for guests. */
function useTabs(pathname: string, bookHref: string): Tab[] {
  const { data: session } = useCustomerSession();
  const signInHref = `/sign-in?from=${encodeURIComponent(pathname)}`;
  const accountHref = session ? "/account" : signInHref;
  return [
    { href: "/", label: "Home", Icon: House, active: pathname === "/" },
    { href: bookHref, label: "Book", Icon: Trophy, active: pathname.startsWith("/grounds"), bookingAction: true },
    { href: "/my-bookings", label: "My bookings", Icon: CalendarDays, active: pathname.startsWith("/my-bookings") },
    { href: accountHref, label: "Account", Icon: UserRound, active: pathname.startsWith("/account"), signIn: !session },
  ];
}
