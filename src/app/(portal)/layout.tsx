import Link from "next/link";
import { cookies } from "next/headers";
import { Facebook, Instagram, LayoutDashboard, MessageCircle, Phone } from "lucide-react";
import { getPublicWebsite } from "@/services/website-settings";
import type { WebsiteSettings } from "@/validations/website-settings";
import type { PublicVenue } from "@/types/settings";
import { VenueMark } from "@/components/portal/venue-mark";
import { CustomerNav } from "@/components/portal/account/customer-nav";

/**
 * The portal locks to the `pitch` theme regardless of the admin theme toggle —
 * every Tailwind token below resolves to the green/gold palette defined in
 * globals.css under `.pitch`.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { venue, social } = await getPublicWebsite();
  return (
    <div className="pitch flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader venue={venue} />
      <main className="flex-1">{children}</main>
      <PortalFooter venue={venue} social={social} />
    </div>
  );
}

async function PortalHeader({ venue }: { venue: PublicVenue }) {
  const isAdmin = Boolean((await cookies()).get("admin_token")?.value);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <VenueMark logoUrl={venue.logoUrl} name={venue.name} />
          <span className="leading-tight">
            <span className="block text-base font-extrabold tracking-tight">{venue.name}</span>
            {venue.tagline && <span className="hidden text-[10px] opacity-60 sm:block">{venue.tagline}</span>}
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
            href={`tel:${venue.phone.replace(/\s/g, "")}`}
            className="mr-2 hidden items-center gap-1 text-xs opacity-80 hover:text-accent sm:inline-flex"
          >
            <Phone className="h-3.5 w-3.5" /> {venue.phone}
          </a>
          {isAdmin && (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-accent/40 px-3 text-sm font-semibold text-accent hover:bg-accent hover:text-accent-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          )}
          <CustomerNav />
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

const SOCIAL_LINKS = [
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
] as const;

function PortalFooter({
  venue, social,
}: {
  venue: PublicVenue; social: WebsiteSettings["social"];
}) {
  const socialLinks = SOCIAL_LINKS.filter(({ key }) => social[key]);
  return (
    <footer className="border-t border-white/10 bg-sidebar text-sidebar-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 text-xs sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <VenueMark logoUrl={venue.logoUrl} name={venue.name} size="sm" />
          <span className="text-base font-extrabold">{venue.name}</span>
          {venue.tagline && (
            <>
              <span className="opacity-40">·</span>
              <span className="opacity-60">{venue.tagline}</span>
            </>
          )}
        </div>
        {socialLinks.length > 0 && (
          <div className="flex items-center gap-3">
            {socialLinks.map(({ key, label, Icon }) => (
              <a key={key} href={social[key]} target="_blank" rel="noopener noreferrer" aria-label={label} className="opacity-70 hover:text-accent hover:opacity-100">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        )}
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
        <span className="opacity-40">© {new Date().getFullYear()} {venue.name}</span>
      </div>
    </footer>
  );
}
