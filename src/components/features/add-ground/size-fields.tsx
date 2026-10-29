"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FORMATS, SURFACES } from "@/types/ground";
import type { AddGroundFormData } from "@/schemas/ground";

const FORMAT_LABEL: Record<(typeof FORMATS)[number], string> = {
  "4x4": "4×4",
  "5x5": "5×5",
  "6x6": "6×6",
  "7x7": "7×7",
  "8x8": "8×8",
  "9x9": "9×9",
  "11x11": "11×11",
  net: "Cricket net",
  court: "Court",
};
const SURFACE_LABEL: Record<(typeof SURFACES)[number], string> = {
  "outdoor-turf": "Outdoor turf",
  "indoor-court": "Indoor court",
  "covered-net": "Covered net",
};

/** Ground size (format), surface and dimensions — all optional. */
export function SizeFields({ form }: { form: UseFormReturn<AddGroundFormData> }) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="space-y-1.5">
        <Label htmlFor="format">Ground size</Label>
        <Controller
          control={control}
          name="format"
          render={({ field }) => (
            <Select
              value={field.value ?? "none"}
              onValueChange={(v) => field.onChange(v === "none" ? undefined : v)}
            >
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not set</SelectItem>
                {FORMATS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {FORMAT_LABEL[f]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="surface">Surface</Label>
        <Controller
          control={control}
          name="surface"
          render={({ field }) => (
            <Select
              value={field.value ?? "none"}
              onValueChange={(v) => field.onChange(v === "none" ? undefined : v)}
            >
              <SelectTrigger id="surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not set</SelectItem>
                {SURFACES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SURFACE_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dimensions">Dimensions</Label>
        <Input
          id="dimensions"
          placeholder="e.g. 28×18 m"
          {...register("dimensions")}
          className={cn(errors.dimensions && "border-destructive")}
        />
        {errors.dimensions && (
          <p className="text-destructive text-xs">{errors.dimensions.message}</p>
        )}
      </div>
    </div>
  );
}
