import type { Metadata, Viewport } from "next";
import { Facebook, Instagram, MessageCircle, Phone } from "lucide-react";
import { getPublicWebsite } from "@/services/website-settings";
import { bookingHref } from "@/services/portal-grounds";
import type { WebsiteSettings } from "@/validations/website-settings";
import type { PublicVenue } from "@/types/settings";
import { VenueMark } from "@/components/portal/venue-mark";
import { MobileMenu } from "@/components/portal/mobile-menu";
import { AdminDashboardLink } from "@/components/portal/admin-dashboard-link";
import { CustomerNav } from "@/components/portal/account/customer-nav";
import { CustomerSignInProvider } from "@/components/portal/account/customer-sign-in-dialog";
import { PortalTabBar } from "@/components/portal/portal-tab-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { FootballClickFeedback } from "@/components/portal/football-click-feedback";
import { PortalLink as Link, TurfPortalScope } from "@/components/portal/turf-portal-scope";
import { getTurfPortalHome, getTurfPortalSlug } from "@/services/turf-portal-request";
import { turfPortalPath } from "@/lib/turf-portal-path";
import { socialMetadata, venueDescription } from "@/lib/seo";
import { tabIcons } from "@/lib/app-icons";
import { cn } from "@/lib/utils";

/** The browser / status bar takes the header colour (the sidebar token is dark in every theme). */
export const viewport: Viewport = { themeColor: "#110d0c" };

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getTurfPortalSlug();
  const { venue } = await getPublicWebsite(slug);
  const description = venueDescription(venue.name, venue.address);
  return {
    title: { default: venue.name, template: `%s · ${venue.name}` },
    description,
    ...(slug && { alternates: { canonical: turfPortalPath(slug) } }),
    icons: tabIcons(slug ? { turf: slug } : undefined),
    ...socialMetadata({ title: venue.name, description, siteName: venue.name }),
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: venue.name },
  };
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const slug = await getTurfPortalSlug();
  const { venue, social } = await getPublicWebsite(slug);
  const [bookHref, homePath] = await Promise.all([bookingHref(slug), getTurfPortalHome(slug)]);
  return (
    <TurfPortalScope slug={slug} timezone={slug ? venue.locale.timezone : undefined} homePath={homePath}>
      <FootballClickFeedback className={cn(
        "flex min-h-screen flex-col bg-background text-foreground [--portal-tabs-height:3.5rem]",
        "max-md:has-[[data-home-search-cta]]:not-has-[[data-mobile-cta]]:pb-16",
        "max-lg:has-[[data-mobile-cta]]:pb-[calc(5rem+env(safe-area-inset-bottom))]",
        "has-[[data-mobile-cta]]:[&_[data-portal-tabs]]:hidden has-[[data-mobile-cta]]:[&_[data-home-search-cta]]:hidden",
      )}>
        <CustomerSignInProvider>
          <PortalHeader venue={venue} bookHref={bookHref} />
          <main id="portal-main" tabIndex={-1} className="flex-1">{children}</main>
          <PortalFooter venue={venue} social={social} />
          <PortalTabBar bookHref={bookHref} />
        </CustomerSignInProvider>
      </FootballClickFeedback>
    </TurfPortalScope>
  );
}

function PortalHeader({ venue, bookHref }: { venue: PublicVenue; bookHref: string }) {
  return (
    // The top padding clears the status bar when the app runs full-screen.
    <header className="sticky top-0 z-40 border-b border-white/10 bg-sidebar pt-[env(safe-area-inset-top)] text-sidebar-foreground">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <VenueMark logoUrl={venue.logoUrl} name={venue.name} />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-base font-extrabold tracking-tight">{venue.name}</span>
            {venue.tagline && <span className="hidden text-[10px] opacity-60 sm:block">{venue.tagline}</span>}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          <Link href={bookHref} className="hover:text-accent">Our grounds</Link>
          <Link href="/#how" className="hover:text-accent">How it works</Link>
          <Link href="/my-bookings" className="hover:text-accent">My bookings</Link>
          <Link href="/#visit" className="hover:text-accent">Visit us</Link>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {venue.phone && (
            <a
              href={`tel:${venue.phone.replace(/\s/g, "")}`}
              className="mr-2 hidden items-center gap-1 text-xs opacity-80 hover:text-accent sm:inline-flex"
            >
              <Phone className="h-3.5 w-3.5" /> {venue.phone}
            </a>
          )}
          <AdminDashboardLink />
          <span className="hidden md:contents"><ThemeToggle /></span>
          {/* Phones reach the account and booking from the tab bar, leaving the venue name room */}
          <span className="hidden md:contents"><CustomerNav /></span>
          <Link
            href={bookHref}
            data-football-kick
            className="hidden h-10 items-center whitespace-nowrap rounded-lg bg-accent px-3 text-sm font-semibold text-accent-foreground hover:opacity-90 sm:px-4 md:inline-flex"
          >
            Book now
          </Link>
          <MobileMenu phone={venue.phone} bookHref={bookHref} />
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
          {venue.phone && (
            <a href={`tel:${venue.phone.replace(/\s/g, "")}`} className="hover:text-accent">Call {venue.phone}</a>
          )}
          {venue.email && <a href={`mailto:${venue.email}`} className="hover:text-accent">{venue.email}</a>}
          {process.env.NODE_ENV !== "production" && (
            <a
              href="/login"
              className="rounded border border-accent/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent hover:bg-accent hover:text-accent-foreground"
            >
              dev · admin
            </a>
          )}
        </div>
        <span className="opacity-40">© {new Date().getFullYear()} {venue.name}</span>
      </div>
    </footer>
  );
}
