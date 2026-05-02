"use client";

import { useWatch, type Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency } from "@/lib/utils";
import { CheckCircle2, XCircle, Users, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { SPORT_GRADIENT, SPORT_EMOJI } from "@/components/features/grounds/ground-card";
import type { AddGroundFormData } from "@/schemas/ground";

const REQUIRED_TOTAL = 8;

function calcSlots(opening: string, closing: string, duration: string): number {
  const openH  = parseInt(opening?.split(":")[0] ?? "0") || 0;
  const closeH = parseInt(closing?.split(":")[0] ?? "0") || 0;
  const hours  = Math.max(0, closeH - openH);
  return Math.floor(hours / (Number(duration || "60") / 60));
}

interface PreviewSidebarProps {
  control: Control<AddGroundFormData>;
  photoCount: number;
  isPending: boolean;
  saveLabel?: string;
  onSave: () => void;
  onDraft: () => void;
  onDiscard: () => void;
}

export function PreviewSidebar({ control, photoCount, isPending, saveLabel = "Save ground", onSave, onDraft, onDiscard }: PreviewSidebarProps) {
  const v = useWatch({ control });

  const gradient   = SPORT_GRADIENT[v.type ?? "other"] ?? SPORT_GRADIENT.other;
  const emoji      = SPORT_EMOJI[v.type ?? "other"] ?? "🏟️";
  const slotsPerDay = calcSlots(v.openingTime ?? "", v.closingTime ?? "", v.slotDuration ?? "60");
  const peakRanges = v.peakRanges?.length ?? 0;
  const amenCount  = v.amenities?.length ?? 0;

  const requiredFilled = [
    !!v.name?.trim(),
    !!v.type,
    (v.capacity ?? 0) > 0,
    !!v.openingTime,
    !!v.closingTime,
    !!v.availableDays,
    (v.peakPrice ?? 0) > 0,
    (v.offPeakPrice ?? 0) > 0,
  ].filter(Boolean).length;

  const optionalFilled = [v.description?.trim(), v.internalNotes?.trim()].filter(Boolean).length;

  const summaryRows = [
    { label: "Sections",           value: "6 total",                 cls: "text-foreground" },
    { label: "Required fields",    value: `${requiredFilled} / ${REQUIRED_TOTAL}`, cls: requiredFilled === REQUIRED_TOTAL ? "text-green-600" : "text-amber-600" },
    { label: "Optional fields",    value: `${optionalFilled} filled`, cls: "text-foreground" },
    { label: "Photos",             value: `${photoCount} of 2`,       cls: "text-foreground" },
    { label: "Amenities selected", value: `${amenCount} of 10`,       cls: "text-foreground" },
    { label: "Peak ranges",        value: `${peakRanges} range${peakRanges !== 1 ? "s" : ""}`, cls: "text-foreground" },
    { label: "Auto slots",         value: slotsPerDay > 0 ? `${slotsPerDay} slots/day` : "—", cls: "text-foreground" },
  ];

  return (
    <div className="space-y-4">
      {/* Live preview card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Gradient header */}
        <div className={cn("flex h-24 items-center justify-center bg-gradient-to-br text-3xl", gradient)}>
          {emoji}
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-base leading-tight">
              {v.name?.trim() || <span className="text-muted-foreground italic text-sm">Ground name</span>}
            </h3>
            <p className="text-sm text-muted-foreground capitalize">
              {v.type || "Sport type"} · {(v.capacity ?? 0) > 0 ? `${v.capacity} players` : "— players"}
            </p>
          </div>

          {(v.peakPrice || v.offPeakPrice) && (
            <div className="space-y-1 text-sm">
              {(v.peakPrice ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground text-xs"><TrendingUp className="h-3 w-3 text-amber-500" />Peak/hr</span>
                  <span className="font-semibold text-amber-600">{formatCurrency(Number(v.peakPrice))}</span>
                </div>
              )}
              {(v.offPeakPrice ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-muted-foreground text-xs"><TrendingDown className="h-3 w-3 text-blue-500" />Off-peak/hr</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(Number(v.offPeakPrice))}</span>
                </div>
              )}
            </div>
          )}

          {(v.openingTime || v.closingTime) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {v.openingTime || "—"} – {v.closingTime || "—"}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs">
            {v.isActive ? (
              <><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /><span className="text-green-600 font-medium">Active</span></>
            ) : (
              <><XCircle className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Inactive</span></>
            )}
            {v.amenities && v.amenities.length > 0 && (
              <><span className="text-muted-foreground/50">·</span><Users className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">{v.amenities.length} amenities</span></>
            )}
          </div>
        </div>
      </div>

      {/* Form summary */}
      <div className="rounded-xl border bg-card p-4 space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Form summary</p>
        {summaryRows.map(({ label, value, cls }) => (
          <div key={label} className="flex items-center justify-between py-0.5">
            <span className="text-sm text-muted-foreground">{label}</span>
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
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onDiscard}
        >
          Discard
        </Button>
      </div>
    </div>
  );
}
