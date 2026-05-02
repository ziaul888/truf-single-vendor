"use client";

import { useRef } from "react";
import Image from "next/image";
import { type UseFormReturn, Controller } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PricingSection } from "./pricing-section";
import type { AddGroundFormData } from "@/schemas/ground";
import { cn } from "@/lib/utils";
import { Upload, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

export type PhotoSlot = File | string | null;

const SPORT_TYPES = ["football","cricket","badminton","tennis","hockey","basketball","other"] as const;
const AMENITIES   = ["Floodlights","Parking","Changing room","Washroom","Scoreboard","Drinking water","First aid","AC","CCTV","Seating area"];
const WEEKDAYS    = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export function SectionCard({ n, title, desc, children }: { n: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-4 border-b px-6 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">{n}</div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </Card>
  );
}

interface GroundFormFieldsProps {
  form: UseFormReturn<AddGroundFormData>;
  photoSlots: PhotoSlot[];
  onPhotoChange: (idx: number, file: File | null) => void;
}

export function GroundFormFields({ form, photoSlots, onPhotoChange }: GroundFormFieldsProps) {
  const { register, control, watch, setValue, formState: { errors } } = form;
  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const photoRefs = [ref0, ref1];

  const availableDays = watch("availableDays");
  const amenities     = watch("amenities") ?? [];

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Photo must be under 2 MB"); return; }
    onPhotoChange(idx, file);
  }

  function removeSlot(idx: number) {
    onPhotoChange(idx, null);
    if (photoRefs[idx].current) photoRefs[idx].current.value = "";
  }

  function toggleAmenity(name: string) {
    setValue("amenities", amenities.includes(name) ? amenities.filter((a) => a !== name) : [...amenities, name]);
  }

  return (
    <div className="space-y-5">
      {/* Section 1 — Basic info */}
      <SectionCard n="1" title="Basic Information" desc="Name, sport type, capacity and description">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Ground name <span className="text-destructive">*</span></Label>
            <Input id="name" placeholder="e.g. Green Arena" {...register("name")} className={cn(errors.name && "border-destructive")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Sport type <span className="text-destructive">*</span></Label>
              <Controller control={control} name="type" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={cn(errors.type && "border-destructive")}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SPORT_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Capacity (players) <span className="text-destructive">*</span></Label>
              <Input id="capacity" type="number" min={1} placeholder="22" {...register("capacity")} className={cn(errors.capacity && "border-destructive")} />
              {errors.capacity && <p className="text-xs text-destructive">{errors.capacity.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Brief description shown to customers…" rows={3} className="resize-none" {...register("description")} />
            <p className="text-xs text-muted-foreground">Optional — shown on customer portal ground detail page.</p>
          </div>
        </div>
      </SectionCard>

      {/* Section 2 — Photos */}
      <SectionCard n="2" title="Ground Photos" desc="Upload up to 2 photos. First photo is the cover image.">
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((idx) => {
            const slot = photoSlots[idx];
            const isFile = slot instanceof File;
            const isUrl  = typeof slot === "string";
            return (
              <div key={idx} className="relative">
                <div
                  onClick={() => !slot && photoRefs[idx].current?.click()}
                  className={cn(
                    "relative flex h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 overflow-hidden transition-colors",
                    slot ? "border-primary/40 bg-primary/5" : "cursor-pointer border-dashed hover:border-primary/50 hover:bg-muted/40"
                  )}
                >
                  {isUrl ? (
                    <>
                      <Image src={slot} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-1">
                        <ImageIcon className="h-6 w-6 text-white" />
                        <p className="text-xs font-medium text-white">Existing photo</p>
                        <button type="button" onClick={(e) => { e.stopPropagation(); photoRefs[idx].current?.click(); }} className="text-[10px] text-white/80 underline">Replace</button>
                      </div>
                    </>
                  ) : isFile ? (
                    <>
                      <ImageIcon className="h-7 w-7 text-primary/60" />
                      <p className="text-xs font-medium text-center px-2">Photo {idx + 1} uploaded</p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[90%]">{slot.name}</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-7 w-7 text-muted-foreground/60" />
                      <p className="text-xs font-medium">Upload photo {idx + 1}{idx === 0 ? " *" : ""}</p>
                      <p className="text-[10px] text-muted-foreground">JPG, PNG · max 2 MB</p>
                    </>
                  )}
                </div>
                {slot && (
                  <button type="button" onClick={() => removeSlot(idx)} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow z-10">
                    <X className="h-3 w-3" />
                  </button>
                )}
                <input ref={photoRefs[idx]} type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => handleFileInput(e, idx)} />
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Section 3 — Operating hours */}
      <SectionCard n="3" title="Operating Hours" desc="Set open/close times and slot duration. Slots auto-generate from these.">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="openingTime">Opening time <span className="text-destructive">*</span></Label>
              <Input id="openingTime" type="time" {...register("openingTime")} className={cn(errors.openingTime && "border-destructive")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="closingTime">Closing time <span className="text-destructive">*</span></Label>
              <Input id="closingTime" type="time" {...register("closingTime")} className={cn(errors.closingTime && "border-destructive")} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Hourly time slots will be auto-generated between these hours.</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Available days <span className="text-destructive">*</span></Label>
              <Controller control={control} name="availableDays" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyday">Every day</SelectItem>
                    <SelectItem value="weekdays">Weekdays (Mon–Fri)</SelectItem>
                    <SelectItem value="weekends">Weekends (Sat–Sun)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-1.5">
              <Label>Slot duration</Label>
              <Controller control={control} name="slotDuration" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>

          {availableDays === "custom" && (
            <div className="space-y-2">
              <Label className="text-sm">Select days</Label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => {
                  const customDays = watch("customDays") ?? [];
                  const checked = customDays.includes(day);
                  return (
                    <label key={day} className={cn("flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors", checked ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted")}>
                      <Checkbox checked={checked} onCheckedChange={(v) => {
                        const curr = watch("customDays") ?? [];
                        setValue("customDays", v ? [...curr, day] : curr.filter((d) => d !== day));
                      }} className="h-3.5 w-3.5" />
                      {day}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Section 4 — Pricing */}
      <SectionCard n="4" title="Pricing" desc="Define peak and off-peak rates. Peak hours take priority.">
        <PricingSection control={control} register={register} errors={errors} />
      </SectionCard>

      {/* Section 5 — Amenities */}
      <SectionCard n="5" title="Amenities" desc="Select all amenities available at this ground.">
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => {
            const active = amenities.includes(a);
            return (
              <button key={a} type="button" onClick={() => toggleAmenity(a)} className={cn("flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all", active ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border hover:border-primary/50 hover:bg-primary/5")}>
                {active && <span className="text-[10px]">✓</span>}
                {a}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Section 6 — Visibility */}
      <SectionCard n="6" title="Visibility & Status" desc="Control where and how this ground appears.">
        <div className="space-y-5">
          {([
            { name: "isActive" as const, label: "Ground active", desc: "Customers can see and book this ground" },
            { name: "showOnPortal" as const, label: "Show on portal", desc: "Listed on the customer booking portal" },
          ]).map(({ name, label, desc }) => (
            <div key={name} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Controller control={control} name={name} render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )} />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label htmlFor="internalNotes">Internal notes</Label>
            <Textarea id="internalNotes" placeholder="Admin-only notes about this ground… (not shown to customers)" rows={3} className="resize-none" {...register("internalNotes")} />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
