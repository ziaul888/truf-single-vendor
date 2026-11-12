import { getPublicWebsite } from "@/services/website-settings";
import { listPublicGrounds } from "@/services/portal-grounds";
import { HeroSection } from "@/components/portal/home/hero-section";
import { SportChipsSection } from "@/components/portal/home/sport-chips-section";
import { FeaturedGroundsSection } from "@/components/portal/home/featured-grounds-section";
import { StatsStrip } from "@/components/portal/home/stats-strip";
import { AmenitiesSection } from "@/components/portal/home/amenities-section";
import { HowItWorksSection } from "@/components/portal/home/how-it-works-section";
import { VisitUsSection } from "@/components/portal/home/visit-us-section";

// Website content and the venue profile can change at any time from the admin, so never prerender.
export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [{ hero, venue, sections }, grounds] = await Promise.all([getPublicWebsite(), listPublicGrounds()]);
  // Sport chips only help when there is more than one ground to tell apart.
  const multi = grounds.length > 1;
  return (
    <>
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
