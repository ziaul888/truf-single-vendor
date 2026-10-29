"use client";

import { useWatch, type Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { SPORT_GRADIENT, SPORT_EMOJI } from "@/components/features/grounds/ground-card";
import type { AddGroundFormData } from "@/schemas/ground";
import { timeToHour } from "@/lib/ground-format";
import { filledPeakRanges } from "@/schemas/ground";

// Required by turf-api: name, sport, hours and price (plus days when custom).
const REQUIRED_TOTAL = 5;

/** Hours between opening and closing. */
function calcSlots(opening: string, closing: string): number {
  const openH = timeToHour(opening);
  const closeH = timeToHour(closing, { isClosing: true });
  return openH === null || closeH === null ? 0 : Math.max(0, closeH - openH);
}

interface PreviewSidebarProps {
  photoCount: number;
  control: Control<AddGroundFormData>;
  isPending: boolean;
  saveLabel?: string;
  onSave: () => void;
  onDraft: () => void;
  onDiscard: () => void;
}

export function PreviewSidebar({
  control,
  isPending,
  saveLabel = "Save ground",
  onSave,
  onDraft,
  onDiscard,
  photoCount,
}: PreviewSidebarProps) {
  const v = useWatch({ control });

  const gradient = SPORT_GRADIENT[v.type ?? "other"] ?? SPORT_GRADIENT.other;
  const emoji = SPORT_EMOJI[v.type ?? "other"] ?? SPORT_EMOJI.other;
  const amenCount = v.amenities?.length ?? 0;
  const peakRanges = filledPeakRanges(
    v.peakRanges as { from: string; to: string }[] | undefined
  ).length;
  const step = v.slotDuration === "120" ? 2 : 1;
  const slotsPerDay = Math.floor(calcSlots(v.openingTime ?? "", v.closingTime ?? "") / step);

  const requiredFilled = [
    !!v.name?.trim(),
    !!v.type,
    !!v.openingTime,
    !!v.closingTime,
    (v.offPeakPrice ?? 0) > 0,
  ].filter(Boolean).length;

  const optionalFilled = [
    v.description?.trim(),
    v.internalNotes?.trim(),
    (v.capacity ?? 0) > 0,
  ].filter(Boolean).length;

  const summaryRows = [
    { label: "Sections", value: "6 total", cls: "text-foreground" },
    {
      label: "Required fields",
      value: `${requiredFilled} / ${REQUIRED_TOTAL}`,
      cls: requiredFilled === REQUIRED_TOTAL ? "text-green-600" : "text-amber-600",
    },
    { label: "Optional fields", value: `${optionalFilled} filled`, cls: "text-foreground" },
    { label: "Photos", value: `${photoCount} of 5`, cls: "text-foreground" },
    { label: "Amenities selected", value: `${amenCount} of 10`, cls: "text-foreground" },
    {
      label: "Peak ranges",
      value: `${peakRanges} range${peakRanges !== 1 ? "s" : ""}`,
      cls: "text-foreground",
    },
    {
      label: "Auto slots",
      value: slotsPerDay > 0 ? `${slotsPerDay} slots/day` : "—",
      cls: "text-foreground",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Live preview card */}
      <div className="bg-card overflow-hidden rounded-xl border">
        {/* Gradient header */}
        <div
          className={cn(
            "flex h-24 items-center justify-center bg-gradient-to-br text-3xl",
            gradient
          )}
        >
          {emoji}
        </div>
        <div className="space-y-3 p-4">
          <div>
            <h3 className="text-base leading-tight font-semibold">
              {v.name?.trim() || (
                <span className="text-muted-foreground text-sm italic">Ground name</span>
              )}
            </h3>
            <p className="text-muted-foreground text-sm capitalize">
              {v.type || "Sport type"} ·{" "}
              {(v.capacity ?? 0) > 0 ? `${v.capacity} players` : "— players"}
            </p>
          </div>

          {((v.peakPrice ?? 0) > 0 || (v.offPeakPrice ?? 0) > 0) && (
            <div className="space-y-1 text-sm">
              {(v.peakPrice ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <TrendingUp className="h-3 w-3 text-amber-500" />
                    Peak/hr
                  </span>
                  <span className="font-semibold text-amber-600">
                    {formatCurrency(Number(v.peakPrice))}
                  </span>
                </div>
              )}
              {(v.offPeakPrice ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <TrendingDown className="h-3 w-3 text-blue-500" />
                    {(v.peakPrice ?? 0) > 0 ? "Off-peak/hr" : "Price/hr"}
                  </span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(Number(v.offPeakPrice))}
                  </span>
                </div>
              )}
            </div>
          )}

          {(v.openingTime || v.closingTime) && (
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5" />
              {v.openingTime || "—"} – {v.closingTime || "—"}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs">
            {v.isActive ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                <span className="font-medium text-green-600">Active</span>
              </>
            ) : (
              <>
                <XCircle className="text-muted-foreground h-3.5 w-3.5" />
                <span className="text-muted-foreground">Inactive</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Form summary */}
      <div className="bg-card space-y-1 rounded-xl border p-4">
        <p className="text-muted-foreground mb-3 text-[11px] font-bold tracking-widest uppercase">
          Form summary
        </p>
        {summaryRows.map(({ label, value, cls }) => (
          <div key={label} className="flex items-center justify-between py-0.5">
            <span className="text-muted-foreground text-sm">{label}</span>
            <span className={cn("text-sm font-medium tabular-nums", cls)}>{value}</span>
          </div>
        ))}
      </div>

      <Separator />

      {/* Actions */}
      <div className="space-y-2">
        <Button className="w-full" onClick={onSave} disabled={isPending}>
          {isPending ? "Saving…" : saveLabel}
        </Button>
        <Button variant="outline" className="w-full" onClick={onDraft} disabled={isPending}>
          Save as draft
        </Button>
        <Button
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full"
          onClick={onDiscard}
        >
          Discard
        </Button>
      </div>
    </div>
  );
}
