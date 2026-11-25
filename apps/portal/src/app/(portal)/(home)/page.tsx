import type { Metadata } from "next";
import { getPublicVenue, getPublicWebsite } from "@/services/website-settings";
import { getTurfPortalHome, getTurfPortalSlug } from "@/services/turf-portal-request";
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
import { HomeSectionReveal } from "@/components/portal/home/home-section-reveal";

// Legacy venue content is cached. Published turf content is checked on each request.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getTurfPortalSlug();
  const venue = await getPublicVenue(slug);
  const title = `${venue.name} · Book turf slots online`;
  const description = venueDescription(venue.name, venue.address);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: await getTurfPortalHome(slug) },
    ...socialMetadata({ title, description, siteName: venue.name }),
  };
}

export default async function LandingPage() {
  const slug = await getTurfPortalSlug();
  const [{ hero, venue, sections }, grounds, homePath] = await Promise.all([
    getPublicWebsite(slug), listPublicGrounds({}, slug), getTurfPortalHome(slug),
  ]);
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
          url: new URL(homePath, origin).href,
          image: `${origin}/app-icon?size=512`,
          telephone: venue.phone || undefined,
          email: venue.email || undefined,
          address: venue.address ? { "@type": "PostalAddress", streetAddress: venue.address } : undefined,
          hasMap: venue.mapUrl || undefined,
        }}
      />
      <HeroSection hero={hero} venueName={venue.name} slug={slug} timezone={slug ? venue.locale.timezone : undefined} />
      <HomeSectionReveal>
        <StatsStrip slug={slug} />
        {multi && sections.sportChips.enabled && <SportChipsSection content={sections.sportChips} slug={slug} />}
        {sections.featuredGrounds.enabled && <FeaturedGroundsSection content={sections.featuredGrounds} slug={slug} />}
        {sections.amenities.enabled && <AmenitiesSection content={sections.amenities} />}
        {sections.howItWorks.enabled && <HowItWorksSection content={sections.howItWorks} slug={slug} />}
        {sections.visitUs.enabled && <VisitUsSection content={sections.visitUs} venue={venue} />}
      </HomeSectionReveal>
    </>
  );
}
