"use client";

import { useState } from "react";
import { useGeneratePreview, useGenerateSlots } from "@/hooks/useSlots";
import { useGrounds } from "@/hooks/useGrounds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toApiFailure } from "@/lib/api-error";
import { addDays, durationLabel, venueToday } from "@/lib/slot-format";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { toast } from "sonner";
import { Zap } from "lucide-react";

interface Props { onSuccess?: () => void; compact?: boolean }

// Hours, slot length and prices always come from the ground; existing slots are never overwritten.
export function GenerateSlotsForm({ onSuccess, compact }: Props) {
  const [groundId, setGroundId] = useState("all");
  const [fromDate, setFromDate] = useState(venueToday);
  const [toDate,   setToDate]   = useState(() => addDays(venueToday(), 6));

  const { data: grounds } = useGrounds();
  const activeGrounds = grounds?.filter((g) => g.isActive) ?? [];
  const ground = activeGrounds.find((g) => g.id === groundId);

  // Debounce a string so typing a date doesn't send a preview per keystroke.
  const [dGround, dFrom, dTo] = useDebouncedValue(`${groundId}|${fromDate}|${toDate}`).split("|");
  const body = { groundId: dGround, fromDate: dFrom, toDate: dTo };
  const preview  = useGeneratePreview(body, Boolean(body.fromDate && body.toDate));
  const generate = useGenerateSlots();
  const previewError = preview.isError ? toApiFailure(preview.error).error : null;
  const result = preview.isError ? undefined : preview.data;
  const newSlots = result?.generated ?? 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    generate.mutate(
      { groundId, fromDate, toDate },
      {
        onSuccess: (res) => {
          toast.success(`Generated ${res.generated} slots (${res.skipped} already existed)`);
          onSuccess?.();
        },
        onError: (err) => toast.error(toApiFailure(err).error),
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
                <SelectItem value="all">All active grounds</SelectItem>
                {activeGrounds.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              {ground
                ? `${ground.openingTime}–${ground.closingTime}, ${durationLabel(ground.slotDurationMinutes)} slots. Hours, slot length and prices come from the ground.`
                : "Each ground uses its own hours, slot length and prices."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>From date <span className="text-destructive">*</span></Label>
              <Input type="date" min={venueToday()} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>To date <span className="text-destructive">*</span></Label>
              <Input type="date" min={fromDate} value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Up to 90 days, starting today or later. Slots that already exist are kept as they are.
          </p>

          {/* Generation preview — counted by turf-api without saving anything */}
          <div className="rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 p-4 space-y-2 text-sm">
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">Generation preview</p>
            {previewError ? (
              <p className="text-destructive">{previewError}</p>
            ) : (
              [
                ["Ground",           ground?.name ?? "All active grounds"],
                ["Date range",       `${fromDate} – ${toDate}${result ? ` (${result.days} day${result.days !== 1 ? "s" : ""})` : ""}`],
                ["Slots per day",    result?.slotsPerDay ?? "—"],
                ["Already exist",    result?.skipped ?? "—"],
                ["New slots",        result?.generated ?? "—"],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between gap-3">
                  <span className="text-emerald-700 dark:text-emerald-400">{k}</span>
                  <span className={cn("text-right font-semibold", k === "New slots" ? "text-emerald-600 dark:text-emerald-300" : "text-emerald-800 dark:text-emerald-200")}>{v}</span>
                </div>
              ))
            )}
          </div>

          <Button type="submit" className="w-full" disabled={generate.isPending || !!previewError || newSlots === 0}>
            <Zap className="mr-1.5 h-4 w-4" />
            {generate.isPending ? "Generating…" : newSlots === 0 && result ? "Nothing new to generate" : `Generate ${newSlots} slots`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
