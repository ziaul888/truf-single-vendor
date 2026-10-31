"use client";

import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { VenueForm } from "@/validations/venue";

type Form = UseFormReturn<VenueForm>;

interface FieldSpec {
  name: keyof VenueForm;
  label: string;
  type?: string;
  placeholder?: string;
  hint?: string;
  /** Spans both columns. */
  wide?: boolean;
}

const VENUE_FIELDS: FieldSpec[] = [
  { name: "name", label: "Venue name" },
  { name: "tagline", label: "Tagline", placeholder: "Banani, Dhaka", hint: "Optional, up to 40 characters. Shown under the name." },
  { name: "phone", label: "Phone", type: "tel", hint: "Shown exactly as typed." },
  { name: "email", label: "Email", type: "email" },
  { name: "supportEmail", label: "Support email", type: "email", hint: "Customer replies go here. Leave empty to use the email above." },
  { name: "openHours", label: "Opening hours", placeholder: "06:00 — 23:00", hint: "Free text for the website. Each ground keeps its own real hours." },
  { name: "address", label: "Address", wide: true },
  { name: "mapUrl", label: "Map link", type: "url", placeholder: "https://maps.google.com/…", hint: "Optional https:// link." },
  { name: "websiteUrl", label: "Website", type: "url", placeholder: "https://", hint: "Optional https:// link." },
];

function VenueField({ form, spec }: { form: Form; spec: FieldSpec }) {
  const error = form.formState.errors[spec.name]?.message;
  const id = `venue-${spec.name}`;
  return (
    <div className={cn("space-y-1.5", spec.wide && "sm:col-span-2")}>
      <Label htmlFor={id}>{spec.label}</Label>
      <Input
        id={id}
        type={spec.type ?? "text"}
        placeholder={spec.placeholder}
        aria-invalid={!!error}
        className={cn(error && "border-destructive")}
        {...form.register(spec.name)}
      />
      {error ? (
        <p className="text-[11px] text-destructive">{error}</p>
      ) : (
        spec.hint && <p className="text-[11px] text-muted-foreground">{spec.hint}</p>
      )}
    </div>
  );
}

/** The editable venue profile inputs, in a two-column grid. */
export function VenueFields({ form }: { form: Form }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {VENUE_FIELDS.map((spec) => <VenueField key={spec.name} form={form} spec={spec} />)}
    </div>
  );
}
