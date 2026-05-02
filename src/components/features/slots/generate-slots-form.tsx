"use client";

import { useState, useMemo } from "react";
import { useGenerateSlots } from "@/hooks/useSlots";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Zap } from "lucide-react";

const GROUNDS = [
  { id: "GR-01", name: "Green Arena — Football",  type: "football",  open: "06:00", close: "23:00" },
  { id: "GR-02", name: "Blue Pitch — Cricket",    type: "cricket",   open: "07:00", close: "22:00" },
  { id: "GR-03", name: "Red Court — Badminton",   type: "badminton", open: "06:00", close: "22:00" },
  { id: "GR-04", name: "Gold Tennis — Tennis",    type: "tennis",    open: "07:00", close: "21:00" },
];

const DURATION_OPTIONS = ["30 min", "1 hour", "2 hours", "Custom"] as const;
type DurationOpt = typeof DURATION_OPTIONS[number];

function calcSlots(open: string, close: string, durationMin: number) {
  const [oh, om] = open.split(":").map(Number);
  const [ch, cm] = close.split(":").map(Number);
  const totalMin = (ch * 60 + cm) - (oh * 60 + om);
  return Math.floor(totalMin / durationMin);
}

function daysBetween(from: string, to: string) {
  const diff = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.round(diff / 86400000) + 1);
}

interface Props { onSuccess?: () => void; compact?: boolean }

export function GenerateSlotsForm({ onSuccess, compact }: Props) {
  const [groundId,     setGroundId]     = useState("GR-01");
  const [fromDate,     setFromDate]     = useState("2026-04-21");
  const [toDate,       setToDate]       = useState("2026-04-27");
  const [duration,     setDuration]     = useState<DurationOpt>("1 hour");
  const [customStart,  setCustomStart]  = useState("07:30");
  const [customEnd,    setCustomEnd]    = useState("09:45");
  const [skipExisting, setSkipExisting] = useState(true);

  const generate = useGenerateSlots();
  const ground   = GROUNDS.find((g) => g.id === groundId)!;
  const durationMin = duration === "30 min" ? 30 : duration === "2 hours" ? 120 : 60;
  const slotsPerDay = calcSlots(ground.open, ground.close, durationMin);
  const days        = daysBetween(fromDate, toDate);
  const existing    = skipExisting ? Math.floor(slotsPerDay * days * 0.12) : 0;
  const newSlots    = slotsPerDay * days - existing;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    generate.mutate(
      { groundId, ground: ground.name.split(" — ")[0], groundType: ground.type, fromDate, toDate, duration, skipExisting },
      {
        onSuccess: (res) => {
          toast.success(`Generated ${res.generated} slots (${res.skipped} skipped)`);
          onSuccess?.();
        },
        onError: () => toast.error("Failed to generate slots"),
      }
    );
  }

  return (
    <Card>
      {!compact && (
        <CardHeader className="pb-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Generate slots</p>
          <CardTitle className="text-base mt-0.5">Auto-generate time slots</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn("space-y-4", compact && "pt-4")}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Ground <span className="text-destructive">*</span></Label>
            <Select value={groundId} onValueChange={setGroundId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GROUNDS.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">Slots generate based on this ground&apos;s operating hours.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>From date <span className="text-destructive">*</span></Label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>To date <span className="text-destructive">*</span></Label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Slot duration</Label>
            <div className="flex gap-2 flex-wrap">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDuration(opt)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm font-medium transition-all",
                    duration === opt
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-muted-foreground/30 text-muted-foreground hover:border-foreground"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            {duration === "Custom" && (
              <p className="text-[11px] text-muted-foreground">Custom lets admin set any start/end time per slot.</p>
            )}
          </div>

          {duration === "Custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Custom start time</Label>
                <Input type="time" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Custom end time</Label>
                <Input type="time" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Skip existing slots?</Label>
            <Select value={skipExisting ? "yes" : "no"} onValueChange={(v) => setSkipExisting(v === "yes")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes — skip if slot already exists</SelectItem>
                <SelectItem value="no">No — overwrite existing slots</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">Recommended: skip to avoid duplicate slots.</p>
          </div>

          {/* Generation preview */}
          <div className="rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 p-4 space-y-2 text-sm">
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">Generation preview</p>
            {[
              ["Ground",           ground.name.split(" — ")[0]],
              ["Date range",       `${fromDate} – ${toDate} (${days} day${days !== 1 ? "s" : ""})`],
              ["Duration",         duration],
              ["Slots per day",    slotsPerDay],
              ["Total to generate",slotsPerDay * days],
              ["Existing skipped", existing],
              ["New slots",        newSlots],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between">
                <span className="text-emerald-700 dark:text-emerald-400">{k}</span>
                <span className={cn("font-semibold", k === "New slots" ? "text-emerald-600 dark:text-emerald-300" : "text-emerald-800 dark:text-emerald-200")}>{v}</span>
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={generate.isPending}>
            <Zap className="mr-1.5 h-4 w-4" />
            {generate.isPending ? "Generating…" : `Generate ${newSlots} slots`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
