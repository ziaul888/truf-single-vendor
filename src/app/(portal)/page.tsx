import { getWebsiteSettings } from "@/services/website-settings";
import { HeroSection } from "@/components/portal/home/hero-section";
import { SportChipsSection } from "@/components/portal/home/sport-chips-section";
import { FeaturedGroundsSection } from "@/components/portal/home/featured-grounds-section";
import { AmenitiesSection } from "@/components/portal/home/amenities-section";
import { HowItWorksSection } from "@/components/portal/home/how-it-works-section";
import { VisitUsSection } from "@/components/portal/home/visit-us-section";

// Website settings can change at any time from the admin, so never prerender.
export const dynamic = "force-dynamic";

export default function LandingPage() {
  const { hero, contact, sections } = getWebsiteSettings();
  return (
    <>
      <HeroSection hero={hero} venueName={contact.venueName} />
      {sections.sportChips.enabled && <SportChipsSection content={sections.sportChips} />}
      {sections.featuredGrounds.enabled && <FeaturedGroundsSection content={sections.featuredGrounds} />}
      {sections.amenities.enabled && <AmenitiesSection content={sections.amenities} />}
      {sections.howItWorks.enabled && <HowItWorksSection content={sections.howItWorks} />}
      {sections.visitUs.enabled && <VisitUsSection content={sections.visitUs} contact={contact} />}
    </>
  );
}
