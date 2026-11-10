"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, HelpCircle, LayoutDashboard, LogOut, MapPin, Menu, Phone, Trophy } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCustomerSession, useCustomerSignOut } from "@/components/portal/account/use-customer-session";

const LINKS = [
  { href: "/#how", label: "How it works", Icon: HelpCircle },
  { href: "/my-bookings", label: "My bookings", Icon: CalendarDays },
  { href: "/#visit", label: "Visit us", Icon: MapPin },
];

/** The header's links for phones and small tablets, where the inline nav is hidden. */
export function MobileMenu({ phone, isAdmin, bookHref }: { phone: string; isAdmin: boolean; bookHref: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const links = [{ href: bookHref, label: "Our grounds", Icon: Trophy }, ...LINKS];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:text-accent md:hidden"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      {/* The sheet renders outside the portal's wrapper, so it needs the pitch theme itself. */}
      <SheetContent className="pitch max-w-xs border-l border-white/10 bg-sidebar text-sidebar-foreground">
        <SheetTitle className="px-6 pb-2 pt-5 text-base">Menu</SheetTitle>
        <nav className="flex flex-col px-3">
          {links.map(({ href, label, Icon }) => (
            <Link key={href} href={href} onClick={close}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium hover:bg-white/5 hover:text-accent">
              <Icon className="h-5 w-5 text-accent" />{label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/dashboard" onClick={close}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium hover:bg-white/5 hover:text-accent">
              <LayoutDashboard className="h-5 w-5 text-accent" />Dashboard
            </Link>
          )}
          <SignOutItem onDone={close} />
        </nav>
        <div className="mt-auto space-y-3 border-t border-white/10 p-6">
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm opacity-85 hover:text-accent">
              <Phone className="h-4 w-4" />{phone}
            </a>
          )}
          <Link href={bookHref} onClick={close}
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
