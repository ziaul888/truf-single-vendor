import { AMENITY_ICONS } from "@/components/portal/amenity-icons";
import type { WebsiteSections } from "@/validations/website-settings";
import { HomeSection, SectionHeading } from "./home-section";

export function AmenitiesSection({ content }: { content: WebsiteSections["amenities"] }) {
  return (
    <HomeSection>
      <SectionHeading title={content.title} subtitle={content.subtitle} />
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 sm:gap-4">
        {content.items.map(({ icon, label }, i) => {
          const { Icon } = AMENITY_ICONS[icon];
          return (
            <li key={`${icon}-${i}`} className="flex flex-col items-center gap-2 rounded-2xl border bg-card px-2 py-4 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold leading-tight">{label}</span>
            </li>
          );
        })}
      </ul>
    </HomeSection>
  );
}
