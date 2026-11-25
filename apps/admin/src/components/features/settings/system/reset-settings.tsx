"use client";

import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useResetSettings } from "@/hooks/useSettings";
import { toApiFailure } from "@/lib/api-error";
import { ConfirmDialog } from "@/components/features/confirm-dialog";
import { SettingsSection } from "@/components/features/settings/settings-section";
import { RESETTABLE_SECTIONS, type ResettableSection } from "@/types/settings";

const SECTION_INFO: Record<ResettableSection, { label: string; desc: string }> = {
  slots: { label: "Booking & slot settings", desc: "Booking window, cancellation cutoff, holds, service fee, pay at venue" },
  notifications: { label: "Notifications", desc: "Sender name, reply-to, email switches and staff recipients" },
  website: { label: "Website", desc: "Portal home page content, images and social links" },
};

const listLabels = (sections: ResettableSection[]) => sections.map((s) => SECTION_INFO[s].label).join(", ");

/** Puts the chosen settings sections back to their defaults, after a confirm step. */
export function ResetSettings() {
  const reset = useResetSettings();
  const [selected, setSelected] = useState<ResettableSection[]>([]);
  const [confirming, setConfirming] = useState(false);

  const toggle = (section: ResettableSection, on: boolean) =>
    setSelected((cur) => (on ? [...cur, section] : cur.filter((s) => s !== section)));

  async function onConfirm() {
    setConfirming(false);
    try {
      await reset.mutateAsync(selected);
      toast.success(`Reset to defaults: ${listLabels(selected)}`);
      setSelected([]);
    } catch (err) {
      toast.error(toApiFailure(err).error);
    }
  }

  return (
    <SettingsSection title="Reset settings to defaults" icon={RotateCcw} description="Undo every change in the sections you pick">
      <div className="space-y-3">
        {RESETTABLE_SECTIONS.map((s) => (
          <div key={s} className="flex items-start gap-3">
            <Checkbox id={`reset-${s}`} checked={selected.includes(s)} onCheckedChange={(v) => toggle(s, v === true)} className="mt-0.5" />
            <Label htmlFor={`reset-${s}`} className="cursor-pointer space-y-0.5 font-normal">
              <span className="block text-sm font-medium">{SECTION_INFO[s].label}</span>
              <span className="block text-xs text-muted-foreground">{SECTION_INFO[s].desc}</span>
            </Label>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
        <p>· Never touches the venue profile, grounds, bookings, customers or payments.</p>
        <p>· Resetting notifications also restores the two notify switches in slot settings.</p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={selected.length === 0 || reset.isPending}
        onClick={() => setConfirming(true)}
      >
        {reset.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="mr-1.5 h-3.5 w-3.5" />}
        {reset.isPending ? "Resetting…" : "Reset selected"}
      </Button>

      <ConfirmDialog
        open={confirming}
        title="Reset these settings?"
        description={`${listLabels(selected)} will go back to their defaults. This can't be undone.`}
        confirmLabel="Reset to defaults"
        onConfirm={onConfirm}
        onCancel={() => setConfirming(false)}
      />
    </SettingsSection>
  );
}
