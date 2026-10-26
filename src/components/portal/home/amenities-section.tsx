import { AMENITY_ICONS } from "@/components/portal/amenity-icons";
import type { WebsiteSections } from "@/validations/website-settings";

export function AmenitiesSection({ content }: { content: WebsiteSections["amenities"] }) {
  return (
    <section className="border-y bg-card py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">{content.title}</h2>
          {content.subtitle && <p className="mt-2 text-sm text-muted-foreground">{content.subtitle}</p>}
        </div>
        {/* Flex + wrap keeps any number of items centred, including a short last row. */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-8 text-center">
          {content.items.map(({ icon, label }, i) => {
            const { Icon } = AMENITY_ICONS[icon];
            return (
              <div key={`${icon}-${i}`} className="w-[calc(50%-0.75rem)] sm:w-36">
                <Icon className="mx-auto h-7 w-7 text-primary" />
                <p className="mt-2 text-xs font-medium">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
