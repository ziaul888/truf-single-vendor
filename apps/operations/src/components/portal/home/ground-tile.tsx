import { FallbackImage } from "@/components/fallback-image";
import { PortalLink as Link } from "@/components/portal/turf-portal-scope";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormatBadge } from "@/components/portal/format-badge";
import { SPORT_META, SURFACE_LABEL } from "@/components/portal/sports";
import type { Ground } from "@/types/api";

/** A photo-first ground card: price on the photo, name and what it is at the bottom, one tap to its slots. */
export function GroundTile({ ground, wide }: { ground: Ground; wide?: boolean }) {
  const kind = [ground.sport && SPORT_META[ground.sport].label, ground.surface && SURFACE_LABEL[ground.surface]]
    .filter(Boolean)
    .join(" · ");
  const image = ground.images?.[0];
  const compact = wide && !image;

  return (
    <Link
      href={`/grounds/${ground.id}`}
      data-football-kick
      className={cn(
        "group relative block overflow-hidden rounded-2xl bg-sidebar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        compact ? "min-h-40 border bg-card" : wide ? "aspect-[2/1] md:aspect-[5/4] xl:aspect-[4/3]" : "aspect-[4/5] sm:aspect-[4/3]",
      )}
    >
      {image ? (
        <FallbackImage
          src={image}
          alt=""
          fill
          sizes={wide ? "(min-width: 1280px) 480px, (min-width: 768px) 40vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 78vw"}
          className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
        />
      ) : !compact && (
        <div className="absolute inset-0 bg-linear-to-br from-primary/80 to-primary/40" />
      )}
      {!compact && <div className="absolute inset-0 bg-linear-to-t from-sidebar/90 via-sidebar/20 to-transparent" />}

      <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
        {ground.format ? <FormatBadge format={ground.format} /> : <span />}
        {!wide && (
          <span className="rounded-full bg-card/90 px-3 py-1 text-sm font-bold backdrop-blur">
            ৳{ground.hourlyRate.toLocaleString()}
            <span className="text-xs font-normal text-muted-foreground">/hr</span>
          </span>
        )}
      </div>

      <div className={cn("absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5", !compact && "text-sidebar-foreground")}>
        <div className="min-w-0">
          <h3 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">{ground.name}</h3>
          {kind && <p className={cn("truncate text-xs sm:text-sm", compact ? "text-muted-foreground" : "opacity-80")}>{kind}</p>}
        </div>
        <span className={cn("inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-accent text-accent-foreground", wide ? "px-3 text-xs font-semibold" : "w-10")}>
          {wide && <span>Ground details</span>}
          <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
