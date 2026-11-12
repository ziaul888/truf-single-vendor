import { Goal } from "lucide-react";
import { cn } from "@/lib/utils";
import { FallbackImage } from "@/components/fallback-image";

/** The venue's uploaded logo, or the default goal icon when none is set. */
export function VenueMark({ logoUrl, name, size = "md" }: { logoUrl: string | null; name: string; size?: "sm" | "md" }) {
  const box = size === "md" ? "h-9 w-9 rounded-lg" : "h-7 w-7 rounded-md";
  const icon = <Goal className={cn("text-accent-foreground", size === "md" ? "h-5 w-5" : "h-4 w-4")} />;
  if (logoUrl) {
    return (
      <span className={cn("relative shrink-0 overflow-hidden bg-white", box)}>
        {/* Served by turf-api through the same-origin proxy; a new file name on every upload. */}
        <FallbackImage
          src={logoUrl}
          alt={`${name} logo`}
          fill
          unoptimized
          sizes="36px"
          className="object-contain"
          // A lost file shows the default icon, as if no logo was set
          fallback={<span className="absolute inset-0 flex items-center justify-center bg-accent">{icon}</span>}
        />
      </span>
    );
  }
  return (
    <span className={cn("flex shrink-0 items-center justify-center bg-accent", box)}>
      {icon}
    </span>
  );
}
