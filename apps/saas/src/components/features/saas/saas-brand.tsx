"use client";

import Link from "next/link";
import { Layers3 } from "lucide-react";
import { FallbackImage } from "@/components/fallback-image";
import { usePlatformBranding } from "@/hooks/usePublicPlatformBranding";
import { cn } from "@/lib/utils";

export function SaasBrand({ homeHref, logoOnly = false }: { homeHref: string; logoOnly?: boolean }) {
  const { data: branding } = usePlatformBranding();
  const icon = <Layers3 aria-hidden className="size-5" />;
  const defaultMark = logoOnly ? <span className="saas-brand-mark">{icon}</span> : icon;

  return (
    <Link href={homeHref} className="saas-brand" aria-label="TurfOrg home">
      <span
        aria-hidden
        className={cn(
          "relative shrink-0 overflow-hidden",
          logoOnly ? "flex h-11 w-28 items-center lg:h-12 lg:w-36" : "saas-brand-mark"
        )}
      >
        {branding?.logoUrl ? (
          <FallbackImage
            src={branding.logoUrl}
            alt=""
            fill
            sizes={logoOnly ? "(min-width: 1024px) 144px, 112px" : "32px"}
            className={cn("object-contain", logoOnly ? "object-left" : "bg-card")}
            fallback={defaultMark}
          />
        ) : (
          defaultMark
        )}
      </span>
      {!logoOnly && (
        <span>
          Turf<span className="text-primary">Org</span>
          <span className="text-primary">.</span>
        </span>
      )}
    </Link>
  );
}
