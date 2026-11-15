import type { Metadata } from "next";
import { getPublicVenue, getPublicWebsite } from "@/services/website-settings";
import { JsonLd } from "@/components/json-ld";
import { siteUrl } from "@/lib/site-url";
import { socialMetadata, venueDescription } from "@/lib/seo";
import { listPublicGrounds } from "@/services/portal-grounds";
import { HeroSection } from "@/components/portal/home/hero-section";
import { SportChipsSection } from "@/components/portal/home/sport-chips-section";
import { FeaturedGroundsSection } from "@/components/portal/home/featured-grounds-section";
import { StatsStrip } from "@/components/portal/home/stats-strip";
import { AmenitiesSection } from "@/components/portal/home/amenities-section";
import { HowItWorksSection } from "@/components/portal/home/how-it-works-section";
import { VisitUsSection } from "@/components/portal/home/visit-us-section";

// No `force-dynamic` here: it turns every fetch on this page to no-store, which would defeat the
// 60 s cache on the website, venue and grounds reads. The portal layout reads cookies, so the page
// is still rendered per request, never prerendered.

export async function generateMetadata(): Promise<Metadata> {
  const venue = await getPublicVenue();
  const title = `${venue.name} · Book turf slots online`;
  const description = venueDescription(venue.name, venue.address);
  return { title: { absolute: title }, description, ...socialMetadata({ title, description, siteName: venue.name }) };
}

export default async function LandingPage() {
  const [{ hero, venue, sections }, grounds] = await Promise.all([getPublicWebsite(), listPublicGrounds()]);
  // Sport chips only help when there is more than one ground to tell apart.
  const multi = grounds.length > 1;
  const origin = siteUrl().origin;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsActivityLocation",
          name: venue.name,
          description: venue.tagline || undefined,
          url: origin,
          image: `${origin}/app-icon?size=512`,
          telephone: venue.phone || undefined,
          email: venue.email || undefined,
          address: venue.address ? { "@type": "PostalAddress", streetAddress: venue.address } : undefined,
          hasMap: venue.mapUrl || undefined,
        }}
      />
      <HeroSection hero={hero} venueName={venue.name} />
      <StatsStrip />
      {multi && sections.sportChips.enabled && <SportChipsSection content={sections.sportChips} />}
      {sections.featuredGrounds.enabled && <FeaturedGroundsSection content={sections.featuredGrounds} />}
      {sections.amenities.enabled && <AmenitiesSection content={sections.amenities} />}
      {sections.howItWorks.enabled && <HowItWorksSection content={sections.howItWorks} />}
      {sections.visitUs.enabled && <VisitUsSection content={sections.visitUs} venue={venue} />}
    </>
  );
}
