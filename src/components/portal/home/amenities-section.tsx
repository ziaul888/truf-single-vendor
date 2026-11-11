import { AMENITY_ICONS } from "@/components/portal/amenity-icons";
import type { WebsiteSections } from "@/validations/website-settings";

export function AmenitiesSection({ content }: { content: WebsiteSections["amenities"] }) {
  return (
    <section className="border-y bg-card py-8 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-5 max-w-2xl sm:mb-10 text-center">
          <h2 className="text-xl font-bold tracking-tight sm:text-3xl">{content.title}</h2>
          {content.subtitle && <p className="mt-2 hidden text-sm text-muted-foreground sm:block">{content.subtitle}</p>}
        </div>
        {/* Flex + wrap keeps any number of items centred, including a short last row. */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-5 text-center sm:gap-x-6 sm:gap-y-8">
          {content.items.map(({ icon, label }, i) => {
            const { Icon } = AMENITY_ICONS[icon];
            return (
              <div key={`${icon}-${i}`} className="w-[calc(33.333%-0.667rem)] sm:w-36">
                <Icon className="mx-auto h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                <p className="mt-2 text-xs font-medium">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
