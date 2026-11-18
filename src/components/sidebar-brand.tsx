"use client";

import { FallbackImage } from "@/components/fallback-image";
import { useVenue } from "@/hooks/useSettings";

function BrandMark({ name, logoUrl }: { name: string; logoUrl?: string }) {
  const initial = name.charAt(0).toUpperCase() || "T";
  if (logoUrl) {
    return (
      <span
        title={name}
        className="ring-primary/40 relative block h-11 w-11 overflow-hidden rounded-2xl bg-white shadow-lg ring-1"
      >
        <FallbackImage
          src={logoUrl}
          alt={`${name} logo`}
          fill
          unoptimized
          sizes="44px"
          className="object-contain"
          fallback={
            <span className="from-primary via-primary to-primary/60 text-primary-foreground absolute inset-0 flex items-center justify-center bg-linear-to-br text-base font-black">
              {initial}
            </span>
          }
        />
      </span>
    );
  }
  return (
    <div
      title={name}
      className="from-primary via-primary to-primary/60 ring-primary/40 flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg ring-1"
    >
      <span className="text-primary-foreground text-base font-black tracking-tight">{initial}</span>
    </div>
  );
}

function StaffSidebarBrand() {
  const { data: venue } = useVenue();
  return <BrandMark name={venue?.name ?? "Turf"} logoUrl={venue?.logoUrl ?? undefined} />;
}

/** The venue's logo from Settings → General (the same one the portal shows), or its initial until one is uploaded. */
export function SidebarBrand({ ownerName }: { ownerName?: string | null }) {
  if (ownerName !== undefined) return <BrandMark name={ownerName || "Turf"} />;
  return <StaffSidebarBrand />;
}
