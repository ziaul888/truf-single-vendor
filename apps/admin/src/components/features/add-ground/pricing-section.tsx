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
      <div className="flex flex-wrap items-center gap-2">
        <span className="bg-primary/10 text-primary flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
          <TrendingUp className="h-3 w-3" /> Peak hours
        </span>
        <span className="bg-info/10 text-info flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
          <TrendingDown className="h-3 w-3" /> Off-peak hours
        </span>
      </div>

      {/* Peak pricing block — optional; leave the price empty for one fixed price */}
      <div className="border-primary/25 bg-primary/5 space-y-4 rounded-xl border p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary h-4 w-4 shrink-0" />
          <Label htmlFor="peak-price" className="text-foreground text-sm font-semibold">
            Peak hour pricing
          </Label>
          {errors.peakPrice && <span className="text-destructive ml-auto text-xs">●</span>}
        </div>

        <div className="space-y-1.5">
          <Input
            id="peak-price"
            type="number"
            min={1}
            placeholder="e.g. 1500"
            aria-invalid={!!errors.peakPrice || undefined}
            aria-describedby="peak-price-help"
            className={cn("bg-background max-w-[160px]", errors.peakPrice && "border-destructive")}
            {...register("peakPrice")}
          />
          {errors.peakPrice && (
            <p className="text-destructive text-xs">{errors.peakPrice.message}</p>
          )}
          <p id="peak-price-help" className="text-muted-foreground text-xs">
            Charged during peak time ranges below.
          </p>
        </div>

        <div className="space-y-2">
          {fields.map((field, i) => (
            <div
              key={field.id}
              className="border-border/70 bg-background/40 space-y-2 rounded-lg border p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-muted-foreground text-xs font-medium">Peak range {i + 1}</p>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove peak range ${i + 1}`}
                    className="text-muted-foreground hover:text-destructive h-10 w-10 shrink-0"
                    onClick={() => remove(i)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="min-w-0 space-y-1.5">
                  <Label htmlFor={`peak-range-${i}-from`} className="text-muted-foreground text-xs">
                    Start time
                  </Label>
                  <HourSelect
                    control={control}
                    name={`peakRanges.${i}.from`}
                    id={`peak-range-${i}-from`}
                    className="bg-background w-full px-2 sm:px-3"
                  />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <Label htmlFor={`peak-range-${i}-to`} className="text-muted-foreground text-xs">
                    End time
                  </Label>
                  <HourSelect
                    control={control}
                    name={`peakRanges.${i}.to`}
                    id={`peak-range-${i}-to`}
                    className="bg-background w-full px-2 sm:px-3"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={() => append({ from: "", to: "" })}
          className="text-primary hover:text-primary/80 h-auto min-h-11 max-w-full justify-start gap-1.5 px-0 whitespace-normal hover:bg-transparent"
        >
          <Plus className="h-4 w-4" />
          Add another peak range
        </Button>

        <p className="text-muted-foreground text-xs italic">
          All other hours within operating time are off-peak.
        </p>
      </div>

      {/* Off-peak pricing block */}
      <div className="border-border bg-muted/40 space-y-3 rounded-xl border p-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="text-info h-4 w-4 shrink-0" />
          <Label htmlFor="off-peak-price" className="text-foreground text-sm font-semibold">
            Off-peak hour pricing
          </Label>
          {errors.offPeakPrice && <span className="text-destructive ml-auto text-xs">●</span>}
        </div>

        <div className="space-y-1.5">
          <Input
            id="off-peak-price"
            type="number"
            min={1}
            placeholder="e.g. 1000"
            aria-invalid={!!errors.offPeakPrice || undefined}
            aria-describedby="off-peak-price-help"
            className={cn(
              "bg-background max-w-[160px]",
              errors.offPeakPrice && "border-destructive"
            )}
            {...register("offPeakPrice")}
          />
          {errors.offPeakPrice && (
            <p className="text-destructive text-xs">{errors.offPeakPrice.message}</p>
          )}
          <p id="off-peak-price-help" className="text-muted-foreground text-xs italic">
            Applied automatically to all non-peak slots.
          </p>
        </div>
      </div>
    </div>
  );
}
