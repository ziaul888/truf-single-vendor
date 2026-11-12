import Image from "next/image";
import Link from "next/link";
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

  return (
    <Link
      href={`/grounds/${ground.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-3xl bg-sidebar",
        wide ? "aspect-[4/3] sm:aspect-[21/9]" : "aspect-[4/5] sm:aspect-[4/3]",
      )}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes={wide ? "(min-width: 1280px) 1200px, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 78vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-primary/80 to-primary/40" />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-sidebar/90 via-sidebar/20 to-transparent" />

      <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
        {ground.format ? <FormatBadge format={ground.format} /> : <span />}
        <span className="rounded-full bg-card/90 px-3 py-1 text-sm font-bold backdrop-blur">
          ৳{ground.hourlyRate.toLocaleString()}
          <span className="text-xs font-normal text-muted-foreground">/hr</span>
        </span>
      </div>

      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 text-sidebar-foreground sm:inset-x-5 sm:bottom-5">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">{ground.name}</h3>
          {kind && <p className="truncate text-xs opacity-80 sm:text-sm">{kind}</p>}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform group-hover:rotate-12">
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}
