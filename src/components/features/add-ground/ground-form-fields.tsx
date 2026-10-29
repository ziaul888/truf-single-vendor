"use client";

import { type UseFormReturn, Controller } from "react-hook-form";
import { SectionCard } from "./section-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PricingSection } from "./pricing-section";
import type { AddGroundFormData } from "@/schemas/ground";
import { cn } from "@/lib/utils";
import { PhotosSection, type PhotoSlot } from "./photos-section";
import { HoursSection } from "./hours-section";
import { AMENITIES, SPORTS as SPORT_TYPES, type Amenity } from "@/types/ground";
import { SizeFields } from "./size-fields";

export type { PhotoSlot };
export { SectionCard };

interface GroundFormFieldsProps {
  form: UseFormReturn<AddGroundFormData>;
  photoSlots: PhotoSlot[];
  onPhotoChange: (idx: number, file: File | null) => void;
  onPhotoMove: (from: number, to: number) => void;
}

export function GroundFormFields({ form, photoSlots, onPhotoChange, onPhotoMove }: GroundFormFieldsProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const amenities = watch("amenities") ?? [];

  function toggleAmenity(name: Amenity) {
    setValue(
      "amenities",
      amenities.includes(name) ? amenities.filter((a) => a !== name) : [...amenities, name]
    );
  }

  return (
    <div className="space-y-5">
      {/* Section 1 — Basic info */}
      <SectionCard
        n="1"
        title="Basic Information"
        desc="Name, sport type, capacity and description"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Ground name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Green Arena"
              {...register("name")}
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                Sport type <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={cn(errors.type && "border-destructive")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORT_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Capacity (players)</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                placeholder="22"
                {...register("capacity")}
                className={cn(errors.capacity && "border-destructive")}
              />
              {errors.capacity && (
                <p className="text-destructive text-xs">{errors.capacity.message}</p>
              )}
            </div>
          </div>
          <SizeFields form={form} />
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description shown to customers…"
              rows={3}
              className="resize-none"
              {...register("description")}
            />
            <p className="text-muted-foreground text-xs">
              Optional — shown on customer portal ground detail page.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="e.g. Plot 7, Road 11, Banani, Dhaka"
              {...register("address")}
              className={cn(errors.address && "border-destructive")}
            />
            {errors.address ? (
              <p className="text-destructive text-xs">{errors.address.message}</p>
            ) : (
              <p className="text-muted-foreground text-xs">Optional — shown to customers on the ground&apos;s page.</p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Section 2 — Photos (not stored by turf-api v1) */}
      <PhotosSection photoSlots={photoSlots} onPhotoChange={onPhotoChange} onPhotoMove={onPhotoMove} />

      {/* Section 3 — Operating hours */}
      <HoursSection form={form} />

      {/* Section 4 — Pricing */}
      <SectionCard
        n="4"
        title="Pricing"
        desc="Define peak and off-peak rates. Peak hours take priority."
      >
        <PricingSection control={control} register={register} errors={errors} />
      </SectionCard>

      {/* Section 5 — Amenities */}
      <SectionCard n="5" title="Amenities" desc="Select all amenities available at this ground.">
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => {
            const active = amenities.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                {active && <span className="text-[10px]">✓</span>}
                {a}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Section 6 — Visibility */}
      <SectionCard
        n="6"
        title="Visibility & Status"
        desc="Control where and how this ground appears."
      >
        <div className="space-y-5">
          {[
            {
              name: "isActive" as const,
              label: "Ground active",
              desc: "Customers can see and book this ground",
            },
            {
              name: "showOnPortal" as const,
              label: "Show on portal",
              desc: "Listed on the customer booking portal",
            },
          ].map(({ name, label, desc }) => (
            <div key={name} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-muted-foreground text-xs">{desc}</p>
              </div>
              <Controller
                control={control}
                name={name}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label htmlFor="internalNotes">Internal notes</Label>
            <Textarea
              id="internalNotes"
              placeholder="Admin-only notes about this ground… (not shown to customers)"
              rows={3}
              className="resize-none"
              {...register("internalNotes")}
            />
            {errors.internalNotes && (
              <p className="text-destructive text-xs">{errors.internalNotes.message}</p>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
