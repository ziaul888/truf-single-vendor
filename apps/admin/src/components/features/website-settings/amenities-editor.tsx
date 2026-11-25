"use client";

import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form";
import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AMENITY_ICONS } from "@/components/portal/amenity-icons";
import { AMENITY_ICON_KEYS, type AmenityIconKey, type WebsiteSettings } from "@/validations/website-settings";
import { FormField } from "./form-primitives";
import { SectionCard } from "./section-card";

type Form = UseFormReturn<WebsiteSettings>;
const MAX_ITEMS = 12;

export function AmenitiesEditor({ form }: { form: Form }) {
  const { register, formState: { errors } } = form;
  const e = errors.sections?.amenities;
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: "sections.amenities.items" });

  return (
    <SectionCard form={form} sectionKey="amenities" title="Amenities" icon={Sparkles} description="The “More than just a pitch” row of icons.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="amenities-title" label="Title" error={e?.title?.message}>
          <Input id="amenities-title" {...register("sections.amenities.title")} />
        </FormField>
        <FormField id="amenities-subtitle" label="Subtitle" error={e?.subtitle?.message}>
          <Input id="amenities-subtitle" {...register("sections.amenities.subtitle")} />
        </FormField>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Items <span className="font-normal text-muted-foreground">({fields.length} of {MAX_ITEMS})</span></p>
        {fields.map((field, i) => (
          <AmenityRow key={field.id} form={form} index={i} count={fields.length} onMove={move} onRemove={remove} />
        ))}
        {e?.items?.message && <p className="text-[11px] text-destructive">{e.items.message}</p>}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={fields.length >= MAX_ITEMS}
          onClick={() => append({ icon: "floodlights", label: "" }, { shouldFocus: true })}
        >
          <Plus className="mr-1.5 h-4 w-4" />Add amenity
        </Button>
      </div>
    </SectionCard>
  );
}

function AmenityRow({
  form, index, count, onMove, onRemove,
}: {
  form: Form; index: number; count: number; onMove: (from: number, to: number) => void; onRemove: (i: number) => void;
}) {
  const error = form.formState.errors.sections?.amenities?.items?.[index]?.label?.message;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Controller
          control={form.control}
          name={`sections.amenities.items.${index}.icon`}
          render={({ field }) => <IconSelect value={field.value} onChange={field.onChange} label={`Icon for amenity ${index + 1}`} />}
        />
        <Input aria-label={`Amenity ${index + 1} label`} placeholder="e.g. Free parking" {...form.register(`sections.amenities.items.${index}.label`)} />
        <Button type="button" size="icon" variant="ghost" aria-label="Move up" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button type="button" size="icon" variant="ghost" aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(index, index + 1)}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button type="button" size="icon" variant="ghost" aria-label="Remove amenity" disabled={count <= 1} onClick={() => onRemove(index)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function IconSelect({ value, onChange, label }: { value: AmenityIconKey; onChange: (v: AmenityIconKey) => void; label: string }) {
  const Current = AMENITY_ICONS[value].Icon;
  return (
    <Select value={value} onValueChange={(v) => onChange(v as AmenityIconKey)}>
      <SelectTrigger className="w-16 shrink-0" aria-label={label}>
        <SelectValue><Current className="h-4 w-4" /></SelectValue>
      </SelectTrigger>
      <SelectContent>
        {AMENITY_ICON_KEYS.map((key) => {
          const { Icon, label: name } = AMENITY_ICONS[key];
          return (
            <SelectItem key={key} value={key}>
              <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{name}</span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
