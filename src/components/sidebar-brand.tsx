"use client";

import Image from "next/image";
import { useVenue } from "@/hooks/useSettings";

/** The venue's logo from Settings → General (the same one the portal shows), or its initial until one is uploaded. */
export function SidebarBrand() {
  const { data: venue } = useVenue();
  const name = venue?.name ?? "";
  if (venue?.logoUrl) {
    return (
      <span title={name} className="relative block h-11 w-11 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-primary/40">
        {/* Served by turf-api through the same-origin proxy; a new file name on every upload. */}
        <Image src={venue.logoUrl} alt={`${name} logo`} fill unoptimized sizes="44px" className="object-contain" />
      </span>
    );
  }
  return (
    <div title={name} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-primary via-primary to-primary/60 shadow-lg ring-1 ring-primary/40">
      <span className="text-base font-black tracking-tight text-primary-foreground">{name.charAt(0).toUpperCase() || "T"}</span>
    </div>
  );
}
