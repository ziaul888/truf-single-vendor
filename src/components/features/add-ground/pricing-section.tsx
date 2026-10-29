"use client";

import {
  useFieldArray,
  type Control,
  type UseFormRegister,
  type FieldErrors,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import type { AddGroundFormData } from "@/schemas/ground";
import { HourSelect } from "./hour-select";

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
        <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <TrendingUp className="h-3 w-3" /> Peak hours
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <TrendingDown className="h-3 w-3" /> Off-peak hours
        </span>
      </div>

      {/* Peak pricing block — optional; leave the price empty for one fixed price */}
      <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            Peak hour pricing
          </span>
          {errors.peakPrice && <span className="text-destructive ml-auto text-xs">●</span>}
        </div>

        <div className="space-y-1.5">
          <Input
            type="number"
            min={1}
            placeholder="e.g. 1500"
            className={cn("bg-background max-w-[160px]", errors.peakPrice && "border-destructive")}
            {...register("peakPrice")}
          />
          {errors.peakPrice && (
            <p className="text-destructive text-xs">{errors.peakPrice.message}</p>
          )}
          <p className="text-muted-foreground text-xs">Charged during peak time ranges below.</p>
        </div>

        <div className="space-y-2">
          {fields.map((field, i) => (
            <div key={field.id} className="flex flex-wrap items-center gap-2">
              <HourSelect
                control={control}
                name={`peakRanges.${i}.from`}
                className="bg-background w-32"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <HourSelect
                control={control}
                name={`peakRanges.${i}.to`}
                className="bg-background w-32"
              />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0"
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
          className="flex items-center gap-1.5 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400"
        >
          <Plus className="h-4 w-4" />
          Add another peak range
        </button>

        <p className="text-muted-foreground text-xs italic">
          All other hours within operating time are off-peak.
        </p>
      </div>

      {/* Off-peak pricing block */}
      <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
            Off-peak hour pricing
          </span>
          {errors.offPeakPrice && <span className="text-destructive ml-auto text-xs">●</span>}
        </div>

        <div className="space-y-1.5">
          <Input
            type="number"
            min={1}
            placeholder="e.g. 1000"
            className={cn(
              "bg-background max-w-[160px]",
              errors.offPeakPrice && "border-destructive"
            )}
            {...register("offPeakPrice")}
          />
          {errors.offPeakPrice && (
            <p className="text-destructive text-xs">{errors.offPeakPrice.message}</p>
          )}
          <p className="text-muted-foreground text-xs italic">
            Applied automatically to all non-peak slots.
          </p>
        </div>
      </div>
    </div>
  );
}
