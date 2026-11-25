"use client";

import { useState } from "react";
import { PortalLink as Link } from "@/components/portal/turf-portal-scope";
import { useRouter } from "next/navigation";
import { HelpCircle, LayoutDashboard, LogOut, MapPin, Menu, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCustomerSession, useCustomerSignOut } from "@/components/portal/account/use-customer-session";
import { useIsAdmin } from "@/components/portal/account/use-admin-hint";

const LINKS = [
  { href: "/#how", label: "How it works", Icon: HelpCircle },
  { href: "/#visit", label: "Visit us", Icon: MapPin },
];

/** The header's links for phones and small tablets, where the inline nav is hidden (the tab bar has Book and My bookings). */
export function MobileMenu({ phone, bookHref }: { phone: string; bookHref: string }) {
  const isAdmin = useIsAdmin();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        type="button"
        aria-label="Open menu"
        className="no-press inline-flex size-11 shrink-0 items-center justify-center rounded-lg hover:text-accent active:bg-sidebar-foreground/10 focus-visible:outline-2 focus-visible:outline-accent md:hidden"
      >
        <Menu className="pointer-events-none size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent
        className="h-dvh max-w-xs border-l border-white/10 bg-sidebar pt-[env(safe-area-inset-top)] text-sidebar-foreground motion-reduce:animate-none"
        closeClassName="no-press right-2 top-[calc(0.5rem+env(safe-area-inset-top))] grid size-11 place-items-center rounded-lg active:bg-sidebar-foreground/10"
      >
        <SheetTitle className="px-6 pb-2 pt-5 pr-16 text-base">Menu</SheetTitle>
        <SheetDescription className="sr-only">Booking website navigation</SheetDescription>
        <nav className="flex min-h-0 flex-col overflow-y-auto px-3">
          {LINKS.map(({ href, label, Icon }) => (
            <Link key={href} href={href} onClick={close}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium hover:bg-white/5 hover:text-accent">
              <Icon className="h-5 w-5 text-accent" />{label}
            </Link>
          ))}
          {isAdmin && (
            <a href="/dashboard" onClick={close}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium hover:bg-white/5 hover:text-accent">
              <LayoutDashboard className="h-5 w-5 text-accent" />Dashboard
            </a>
          )}
          <SignOutItem onDone={close} />
        </nav>
        <div className="mt-auto shrink-0 space-y-3 border-t border-white/10 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm opacity-85 hover:text-accent">
              <Phone className="h-4 w-4" />{phone}
            </a>
          )}
          <Link href={bookHref} onClick={close} data-football-kick
            className="flex h-11 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-accent-foreground hover:opacity-90">
            Book now
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Signed in: Sign out (the header hides its sign-out icon on phones). */
function SignOutItem({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const { data: session } = useCustomerSession();
  const signOut = useCustomerSignOut();
  if (!session) return null;
  return (
    <button type="button" disabled={signOut.isPending}
      onClick={() => signOut.mutate(undefined, { onSuccess: () => { onDone(); router.refresh(); } })}
      className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-base font-medium hover:bg-white/5 hover:text-accent disabled:opacity-60">
      <LogOut className="h-5 w-5 text-accent" />{signOut.isPending ? "Signing out…" : "Sign out"}
    </button>
  );
}
