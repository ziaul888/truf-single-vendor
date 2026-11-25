import { PlatformBrandMark } from "@/components/features/platform/platform-brand-mark";
import { getTurfLoginBranding, TURFORG_BRAND } from "@/services/tab-branding";
import type { PublicVenue } from "@/types/settings";

export async function TurfLoginBrand({ turf }: { turf?: string | string[] }) {
  const brand = await getTurfLoginBranding(turf);
  return <LoginBrand venue={brand?.venue} />;
}

export function LoginBrand({ venue }: { venue?: Pick<PublicVenue, "name" | "logoUrl"> }) {
  return (
    <div className="flex min-h-11 items-center gap-3">
      <PlatformBrandMark logoUrl={venue?.logoUrl ?? null} />
      <p className="min-w-0 text-lg font-bold tracking-tight [overflow-wrap:anywhere]">
        {venue?.name || TURFORG_BRAND.name}
      </p>
    </div>
  );
}
