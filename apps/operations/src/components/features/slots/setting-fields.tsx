"use client";

import type { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** A labelled number input with a unit after it, for the slot settings page. */
export function NumberSetting({ id, label, unit, min = 0, max, step, hint, error, registration }: {
  id: string; label: string; unit: string; min?: number; max: number; step?: string; hint: string; error?: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input id={id} type="number" min={min} max={max} step={step} {...registration} className={cn("w-24", error && "border-destructive")} />
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      {error ? <p className="text-[11px] text-destructive">{error}</p> : <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** A label and description with a switch on the right. */
export function SettingToggle({ label, desc, checked, onChange, disabled }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", disabled && "opacity-60")}>
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} className="shrink-0 mt-0.5" />
    </div>
  );
}
