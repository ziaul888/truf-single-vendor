import Link from "next/link";
import { Goal, Phone } from "lucide-react";
import { VENUE } from "@/lib/portal-stub-data";

/**
 * The portal locks to the `pitch` theme regardless of the admin theme toggle —
 * every Tailwind token below resolves to the green/gold palette defined in
 * globals.css under `.pitch`.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pitch flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex-1">{children}</main>
      <PortalFooter />
    </div>
  );
}

function PortalHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Goal className="h-5 w-5 text-accent-foreground" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold tracking-tight">{VENUE.name}</span>
            <span className="hidden text-[10px] opacity-60 sm:block">Banani, Dhaka</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          <Link href="/grounds" className="hover:text-accent">Our grounds</Link>
          <Link href="/#how" className="hover:text-accent">How it works</Link>
          <Link href="/my-bookings" className="hover:text-accent">My bookings</Link>
          <Link href="/#visit" className="hover:text-accent">Visit us</Link>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${VENUE.phone.replace(/\s/g, "")}`}
            className="mr-2 hidden items-center gap-1 text-xs opacity-80 hover:text-accent sm:inline-flex"
          >
            <Phone className="h-3.5 w-3.5" /> {VENUE.phone}
          </a>
          <Link
            href="/grounds"
            className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            Book now
          </Link>
        </div>
      </div>
    </header>
  );
}

function PortalFooter() {
  return (
    <footer className="border-t border-white/10 bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 text-xs sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent">
            <Goal className="h-4 w-4 text-accent-foreground" />
          </span>
          <span className="text-base font-extrabold">{VENUE.name}</span>
          <span className="opacity-40">·</span>
          <span className="opacity-60">Banani, Dhaka</span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="#" className="hover:text-accent">Cancellation policy</Link>
          <Link href="#" className="hover:text-accent">Terms</Link>
          <Link href="#" className="hover:text-accent">Privacy</Link>
          <Link href="#" className="hover:text-accent">Contact</Link>
          {process.env.NODE_ENV !== "production" && (
            <Link
              href="/login"
              className="rounded border border-accent/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent hover:bg-accent hover:text-accent-foreground"
            >
              dev · admin
            </Link>
          )}
        </div>
        <span className="opacity-40">© 2026 {VENUE.name}</span>
      </div>
    </footer>
  );
}
