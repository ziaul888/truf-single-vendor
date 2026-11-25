import { Layers3 } from "lucide-react";
import { FallbackImage } from "@/components/fallback-image";
import { cn } from "@/lib/utils";

export function PlatformBrandMark({
  logoUrl,
  className,
  sidebar = false,
}: {
  logoUrl: string | null;
  className?: string;
  sidebar?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl",
        sidebar
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "bg-primary text-primary-foreground",
        className
      )}
    >
      {logoUrl ? (
        <FallbackImage
          src={logoUrl}
          alt=""
          fill
          unoptimized
          sizes="(max-width: 1023px) 36px, 44px"
          className="bg-card object-contain"
          fallback={<Layers3 className="size-5" />}
        />
      ) : (
        <Layers3 className="size-5" />
      )}
    </span>
  );
}
