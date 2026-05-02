import Link from "next/link";
import Image from "next/image";
import type { Ground } from "@/types/api";
import { FormatBadge } from "@/components/portal/format-badge";

export function GroundCard({ ground, badge }: { ground: Ground; badge?: string }) {
  return (
    <article className="group overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-48 w-full">
        {ground.images[0] && (
          <Image
            src={ground.images[0]}
            alt={ground.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        )}
        <FormatBadge format={ground.format} className="absolute left-3 top-3" />
        {badge && (
          <span className="absolute right-3 top-3 inline-block rounded-full bg-card/95 px-2 py-0.5 text-[11px] font-bold">
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold">{ground.name}</h3>
            <p className="mt-0.5 text-xs capitalize text-muted-foreground">
              {ground.sport} · {ground.surface.replace("-", " ")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">From</p>
            <p className="font-bold">
              ৳{ground.hourlyRate.toLocaleString()}
              <span className="text-xs font-normal text-muted-foreground">/hr</span>
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {ground.amenities.slice(0, 3).map((a) => (
            <span key={a} className="rounded border bg-muted/50 px-2 py-1 text-[10px]">
              {a}
            </span>
          ))}
        </div>
        <Link
          href={`/grounds/${ground.id}`}
          className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          View slots
        </Link>
      </div>
    </article>
  );
}
