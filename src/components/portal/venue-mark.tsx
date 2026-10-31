import Image from "next/image";
import { Goal } from "lucide-react";
import { cn } from "@/lib/utils";

/** The venue's uploaded logo, or the default goal icon when none is set. */
export function VenueMark({ logoUrl, name, size = "md" }: { logoUrl: string | null; name: string; size?: "sm" | "md" }) {
  const box = size === "md" ? "h-9 w-9 rounded-lg" : "h-7 w-7 rounded-md";
  if (logoUrl) {
    return (
      <span className={cn("relative shrink-0 overflow-hidden bg-white", box)}>
        {/* Served by turf-api through the same-origin proxy; a new file name on every upload. */}
        <Image src={logoUrl} alt={`${name} logo`} fill unoptimized sizes="36px" className="object-contain" />
      </span>
    );
  }
  return (
    <span className={cn("flex shrink-0 items-center justify-center bg-accent", box)}>
      <Goal className={cn("text-accent-foreground", size === "md" ? "h-5 w-5" : "h-4 w-4")} />
    </span>
  );
}
