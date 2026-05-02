"use client";

import { useState } from "react";
import { useBlockSlot } from "@/hooks/useSlots";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Ban, AlertTriangle } from "lucide-react";

const GROUNDS = [
  { id: "GR-01", name: "Green Arena — Football" },
  { id: "GR-02", name: "Blue Pitch — Cricket" },
  { id: "GR-03", name: "Red Court — Badminton" },
  { id: "GR-04", name: "Gold Tennis — Tennis" },
];

const BLOCK_REASONS = ["Maintenance", "Reserved", "Event", "Weather", "Other"];
const BLOCK_TYPES   = ["Single slot", "Recurring weekly", "Full day"];

const SLOTS_FOR_DATE: Record<string, { id: string; label: string; hasBooking?: boolean }[]> = {
  "GR-01": [
    { id: "SL-001", label: "6:00 AM – 7:00 AM" },
    { id: "SL-002", label: "7:00 AM – 8:00 AM" },
    { id: "SL-003", label: "8:00 AM – 10:00 AM", hasBooking: true },
    { id: "SL-011", label: "10:00 AM – 12:00 PM" },
    { id: "SL-006", label: "12:00 PM – 1:00 PM" },
    { id: "SL-013", label: "4:00 PM – 5:00 PM" },
    { id: "SL-014", label: "5:00 PM – 6:00 PM", hasBooking: true },
  ],
  "GR-02": [
    { id: "SL-018", label: "7:00 AM – 8:00 AM" },
    { id: "SL-019", label: "8:00 AM – 10:00 AM", hasBooking: true },
    { id: "SL-020", label: "10:00 AM – 12:00 PM" },
    { id: "SL-022", label: "1:00 PM – 2:00 PM", hasBooking: true },
    { id: "SL-023", label: "5:00 PM – 6:00 PM" },
  ],
  "GR-03": [
    { id: "SL-024", label: "6:00 AM – 6:30 AM" },
    { id: "SL-026", label: "7:00 AM – 8:00 AM" },
    { id: "SL-027", label: "4:00 PM – 5:00 PM" },
  ],
  "GR-04": [
    { id: "SL-029", label: "7:00 AM – 8:00 AM" },
    { id: "SL-030", label: "8:00 AM – 9:00 AM", hasBooking: true },
    { id: "SL-031", label: "5:00 PM – 6:00 PM" },
  ],
};

interface Props { onSuccess?: () => void; compact?: boolean }

export function BlockSlotForm({ onSuccess, compact }: Props) {
  const [groundId,  setGroundId]  = useState("GR-01");
  const [blockType, setBlockType] = useState("Single slot");
  const [date,      setDate]      = useState("2026-04-21");
  const [slotId,    setSlotId]    = useState("SL-011");
  const [reason,    setReason]    = useState("Maintenance");
  const [note,      setNote]      = useState("");

  const blockMutation = useBlockSlot();
  const availableSlots = SLOTS_FOR_DATE[groundId] ?? [];
  const selectedSlot   = availableSlots.find((s) => s.id === slotId);
  const hasBooking     = selectedSlot?.hasBooking ?? false;
  const groundName     = GROUNDS.find((g) => g.id === groundId)?.name.split(" — ")[0] ?? "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    blockMutation.mutate(
      { slotId, reason, note },
      {
        onSuccess: () => {
          toast.success("Slot blocked successfully");
          onSuccess?.();
        },
        onError: () => toast.error("Failed to block slot"),
      }
    );
  }

  return (
    <Card>
      {!compact && (
        <CardHeader className="pb-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Block slot</p>
          <CardTitle className="text-base mt-0.5">Block a time slot</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("space-y-4", compact && "pt-4")}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Ground <span className="text-destructive">*</span></Label>
            <Select value={groundId} onValueChange={(v) => { setGroundId(v); setSlotId(SLOTS_FOR_DATE[v]?.[0]?.id ?? ""); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GROUNDS.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Block type <span className="text-destructive">*</span></Label>
            <Select value={blockType} onValueChange={setBlockType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BLOCK_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            {blockType === "Recurring weekly" && (
              <p className="text-[11px] text-muted-foreground">Recurring useful for weekly maintenance schedules.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date <span className="text-destructive">*</span></Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Slot <span className="text-destructive">*</span></Label>
              <Select value={slotId} onValueChange={setSlotId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableSlots.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}{s.hasBooking ? " ⚠" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Block reason <span className="text-destructive">*</span></Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BLOCK_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Note <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
            <textarea
              rows={3}
              placeholder="Additional details about this block (admin only)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          {/* Block summary */}
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 space-y-2 text-sm">
            <p className="font-semibold text-red-800 dark:text-red-300">Block summary</p>
            {[
              ["Ground", groundName],
              ["Date",   new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })],
              ["Slot",   selectedSlot?.label ?? "—"],
              ["Reason", reason],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between">
                <span className="text-red-700 dark:text-red-400">{k}</span>
                <span className="font-semibold text-red-800 dark:text-red-200">{v}</span>
              </div>
            ))}
          </div>

          {/* Booking warning */}
          {hasBooking && (
            <div className="flex gap-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
              <span>Blocking a slot with an existing booking will cancel that booking automatically.</span>
            </div>
          )}

          <Button type="submit" variant="destructive" className="w-full" disabled={blockMutation.isPending || !slotId}>
            <Ban className="mr-1.5 h-4 w-4" />
            {blockMutation.isPending ? "Blocking…" : "Block slot"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
