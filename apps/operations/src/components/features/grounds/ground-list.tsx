"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { LayoutList, Pencil } from "lucide-react";
import type { Ground } from "@/hooks/useGrounds";
import { SPORT_EMOJI, SPORT_GRADIENT } from "./ground-card";

interface GroundListProps {
  grounds: Ground[];
  onToggleStatus: (g: Ground) => void;
  isPending: boolean;
  /** Admins only — managers can view grounds but not change them. */
  canEdit: boolean;
}

function GroundListItem({ g, onToggleStatus, isPending, canEdit }: Omit<GroundListProps, "grounds"> & { g: Ground }) {
  return (
    <li className={cn("space-y-2 px-4 py-3", !g.isActive && "opacity-60")}>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-base", SPORT_GRADIENT[g.sport] ?? SPORT_GRADIENT.other)}>
          {SPORT_EMOJI[g.sport] ?? SPORT_EMOJI.other}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{g.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            <span className="capitalize">{g.sport}</span> · {g.openingTime} – {g.closingTime} · {g.isActive ? "Active" : "Inactive"}
          </p>
        </div>
        <div className="shrink-0 text-right text-sm font-semibold tabular-nums">
          {formatCurrency(g.pricePerHour)}
          {g.peakPricePerHour !== null && (
            <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Peak {formatCurrency(g.peakPricePerHour)}</div>
          )}
        </div>
      </div>
      <div className="flex gap-2 [&>*]:flex-1">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/grounds/${g.id}`}><LayoutList className="mr-1 h-3.5 w-3.5" /> Slots</Link>
        </Button>
        {canEdit && (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/grounds/${g.id}/edit`}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => onToggleStatus(g)} disabled={isPending}
              className={g.isActive ? "text-destructive hover:text-destructive" : "text-green-600 hover:text-green-700"}>
              {g.isActive ? "Deactivate" : "Activate"}
            </Button>
          </>
        )}
      </div>
    </li>
  );
}

/** Grounds as stacked rows for phones, where the table would scroll sideways. */
export function GroundList({ grounds, ...rest }: GroundListProps) {
  return (
    <ul className="divide-y rounded-xl border">
      {grounds.map((g) => <GroundListItem key={g.id} g={g} {...rest} />)}
    </ul>
  );
}
