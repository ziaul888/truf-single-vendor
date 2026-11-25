import type { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Optional bKash / Nagad TrxID on the staff payment forms. */
export function TrxIdField({ id, registration, error }: { id: string; registration: UseFormRegisterReturn; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>TrxID <span className="font-normal text-muted-foreground">(optional)</span></Label>
      <Input id={id} autoComplete="off" placeholder="e.g. 9BC4D7XK2M" className="font-mono uppercase" {...registration} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
