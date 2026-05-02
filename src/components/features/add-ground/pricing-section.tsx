"use client";

import { useFieldArray, type Control, type UseFormRegister, type FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import type { AddGroundFormData } from "@/schemas/ground";

interface PricingSectionProps {
  control: Control<AddGroundFormData>;
  register: UseFormRegister<AddGroundFormData>;
  errors: FieldErrors<AddGroundFormData>;
}

export function PricingSection({ control, register, errors }: PricingSectionProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "peakRanges" });

  return (
    <div className="space-y-4">
      {/* Section labels */}
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <TrendingUp className="h-3 w-3" /> Peak hours
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
          <TrendingDown className="h-3 w-3" /> Off-peak hours
        </span>
      </div>

      {/* Peak pricing block */}
      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Peak hour pricing</span>
          {errors.peakPrice && <span className="text-xs text-destructive ml-auto">●</span>}
        </div>

        <div className="space-y-1.5">
          <Input
            type="number"
            min={1}
            placeholder="e.g. 1500"
            className={cn("max-w-[160px] bg-background", errors.peakPrice && "border-destructive")}
            {...register("peakPrice")}
          />
          {errors.peakPrice && <p className="text-xs text-destructive">{errors.peakPrice.message}</p>}
          <p className="text-xs text-muted-foreground">Charged during peak time ranges below.</p>
        </div>

        <div className="space-y-2">
          {fields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-2 flex-wrap">
              <Input type="time" className="w-32 bg-background" {...register(`peakRanges.${i}.from`)} />
              <span className="text-sm text-muted-foreground">to</span>
              <Input type="time" className="w-32 bg-background" {...register(`peakRanges.${i}.to`)} />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(i)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => append({ from: "", to: "" })}
          className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add another peak range
        </button>

        <p className="text-xs italic text-muted-foreground">
          All other hours within operating time are off-peak.
        </p>
      </div>

      {/* Off-peak pricing block */}
      <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Off-peak hour pricing</span>
          {errors.offPeakPrice && <span className="text-xs text-destructive ml-auto">●</span>}
        </div>

        <div className="space-y-1.5">
          <Input
            type="number"
            min={1}
            placeholder="e.g. 1000"
            className={cn("max-w-[160px] bg-background", errors.offPeakPrice && "border-destructive")}
            {...register("offPeakPrice")}
          />
          {errors.offPeakPrice && <p className="text-xs text-destructive">{errors.offPeakPrice.message}</p>}
          <p className="text-xs italic text-muted-foreground">Applied automatically to all non-peak slots.</p>
        </div>
      </div>
    </div>
  );
}
