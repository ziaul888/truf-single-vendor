"use client";

import { useState } from "react";
import { useBlockSlot, useBulkBlock, useSlots, type Slot } from "@/hooks/useSlots";
import { useGrounds } from "@/hooks/useGrounds";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toApiFailure } from "@/lib/api-error";
import { BLOCK_REASON_LABEL, addDays, formatSlotDate, slotTimeLabel, venueToday } from "@/lib/slot-format";
import { BLOCK_REASONS, type BlockReason, type BulkBlockInput } from "@/types/slot";
import { WEEKDAYS, type Weekday } from "@/types/ground";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/features/confirm-dialog";
import { Ban } from "lucide-react";
import { blockedToast } from "./block-booked-slot-dialog";
import { BlockSummary, BlockWarning } from "./block-slot-summary";

const BLOCK_TYPES = [
  { value: "single", label: "Single slot" },
  { value: "recurringWeekly", label: "Recurring weekly" },
  { value: "fullDay", label: "Full day" },
] as const;
type BlockType = (typeof BLOCK_TYPES)[number]["value"];

const WHOLE_DAY = "whole-day";

/** Single blocks: free slots, and booked ones (cancelling the booking). Held and blocked slots can't be picked. */
const canPickSingle = (s: Slot) => s.status === "available" || s.status === "booked";

const slotOptionLabel = (s: Slot) =>
  s.status === "held" ? " · customer paying"
  : s.status === "booked" && s.booking ? ` · booked (${s.booking.customerName})`
  : s.status !== "available" ? ` · ${s.status}` : "";

interface Props { onSuccess?: () => void; compact?: boolean }

export function BlockSlotForm({ onSuccess, compact }: Props) {
  const [groundId,  setGroundId]  = useState("");
  const [blockType, setBlockType] = useState<BlockType>("single");
  const [date,      setDate]      = useState(venueToday);
  const [slotHour,  setSlotHour]  = useState("");
  const [weekdays,  setWeekdays]  = useState<Weekday[]>([]);
  const [untilDate, setUntilDate] = useState(() => addDays(venueToday(), 28));
  const [reason,    setReason]    = useState<BlockReason>("maintenance");
  const [note,      setNote]      = useState("");
  const [cancelBooking, setCancelBooking] = useState(false);

  const { data: grounds } = useGrounds();
  const activeGrounds = grounds?.filter((g) => g.isActive) ?? [];
  const ground = activeGrounds.find((g) => g.id === groundId) ?? activeGrounds[0];

  // The slot list is that ground's real slots on the chosen date.
  const { data: daySlots, isLoading: slotsLoading } = useSlots(
    { groundId: ground?.id, date, limit: 100 },
    { enabled: Boolean(ground && date) },
  );
  const slots = daySlots?.data ?? [];
  const selectedSlot = slots.find((s) => String(s.startHour) === slotHour);
  const single = blockType === "single";
  // A booked slot can be blocked only by cancelling (and refunding) its booking.
  const needsCancel = single && selectedSlot?.status === "booked";
  const slotUnavailable = single && !!selectedSlot && !canPickSingle(selectedSlot);
  const bookedThatDay = blockType === "fullDay" ? slots.filter((s) => s.status === "booked").length : 0;

  const blockMutation = useBulkBlock();
  const singleBlock = useBlockSlot();
  const pending = blockMutation.isPending || singleBlock.isPending;
  const [confirming, setConfirming] = useState(false);

  function buildBody(): BulkBlockInput | null {
    if (!ground) return null;
    const base = { groundId: ground.id, date, reason, note: note.trim() || undefined };
    if (blockType === "single") {
      return selectedSlot ? { ...base, type: "single", startHour: selectedSlot.startHour } : null;
    }
    if (blockType === "fullDay") return { ...base, type: "fullDay" };
    if (weekdays.length === 0) return null;
    return {
      ...base,
      type: "recurringWeekly",
      weekdays,
      untilDate,
      startHour: slotHour && slotHour !== WHOLE_DAY ? Number(slotHour) : undefined,
    };
  }
  const body = buildBody();

  // Full-day and weekly blocks can cover many slots, so they ask first.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body) return;
    if (needsCancel && selectedSlot) blockBookedSlot(selectedSlot);
    else if (body.type === "single") submitBlock(body);
    else setConfirming(true);
  }

  // The bulk endpoint may not cancel bookings, so a booked slot goes through the single-slot endpoint.
  function blockBookedSlot(slot: Slot) {
    singleBlock.mutate(
      { id: slot.id, reason, note: note.trim() || undefined, cancelBooking: true },
      {
        onSuccess: (res) => { blockedToast(reason, res.cancelledBooking, slot.booking?.bookingNumber); setCancelBooking(false); onSuccess?.(); },
        onError: (err) => toast.error(toApiFailure(err).error),
      },
    );
  }

  function pickSlot(hour: string) {
    setSlotHour(hour);
    setCancelBooking(false);
  }

  function submitBlock(body: BulkBlockInput) {
    blockMutation.mutate(body, {
      onSuccess: (res) => {
        const skipped = res.skippedBooked ? ` (${res.skippedBooked} booked slot${res.skippedBooked === 1 ? "" : "s"} left as they were)` : "";
        toast.success(`Blocked ${res.blocked} slot${res.blocked === 1 ? "" : "s"}${skipped}`);
        onSuccess?.();
      },
      onError: (err) => toast.error(toApiFailure(err).error),
    });
  }

  function toggleWeekday(day: Weekday, on: boolean) {
    setWeekdays((cur) => (on ? [...cur, day] : cur.filter((d) => d !== day)));
  }

  const slotSummary =
    blockType === "fullDay" ? "Whole day"
    : blockType === "single" ? (selectedSlot ? slotTimeLabel(selectedSlot) : "—")
    : slotHour && slotHour !== WHOLE_DAY && selectedSlot ? slotTimeLabel(selectedSlot) : "Whole day";

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
            <Select value={ground?.id ?? ""} onValueChange={(v) => { setGroundId(v); pickSlot(""); }}>
              <SelectTrigger><SelectValue placeholder="Select a ground" /></SelectTrigger>
              <SelectContent>
                {activeGrounds.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Block type <span className="text-destructive">*</span></Label>
            <Select value={blockType} onValueChange={(v) => { setBlockType(v as BlockType); pickSlot(""); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BLOCK_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {blockType === "recurringWeekly" && (
              <p className="text-[11px] text-muted-foreground">Recurring useful for weekly maintenance schedules.</p>
            )}
          </div>

          <div className={cn("grid gap-3", blockType === "fullDay" ? "grid-cols-1" : "grid-cols-2")}>
            <div className="space-y-1.5">
              <Label>{blockType === "recurringWeekly" ? "Starting" : "Date"} <span className="text-destructive">*</span></Label>
              <Input type="date" min={venueToday()} value={date} onChange={(e) => { setDate(e.target.value); pickSlot(""); }} />
            </div>
            {blockType !== "fullDay" && (
              <div className="space-y-1.5">
                <Label>Slot {blockType === "single" && <span className="text-destructive">*</span>}</Label>
                <Select value={slotHour} onValueChange={pickSlot}>
                  <SelectTrigger>
                    <SelectValue placeholder={slotsLoading ? "Loading…" : blockType === "single" ? "Select a slot" : "Whole day"} />
                  </SelectTrigger>
                  <SelectContent>
                    {blockType === "recurringWeekly" && <SelectItem value={WHOLE_DAY}>Whole day</SelectItem>}
                    {slots.map((s) => (
                      <SelectItem key={s.id} value={String(s.startHour)} disabled={single && !canPickSingle(s)}>
                        {slotTimeLabel(s)}{slotOptionLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!slotsLoading && slots.length === 0 && (
                  <p className="text-[11px] text-muted-foreground">No slots on this date. The ground may be closed, or slots not generated yet.</p>
                )}
              </div>
            )}
          </div>

          {blockType === "recurringWeekly" && (
            <>
              <div className="space-y-2">
                <Label>Repeat on <span className="text-destructive">*</span></Label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => {
                    const checked = weekdays.includes(day);
                    return (
                      <label key={day} className={cn("flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium capitalize transition-colors", checked ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted")}>
                        <Checkbox checked={checked} onCheckedChange={(v) => toggleWeekday(day, v === true)} className="h-3.5 w-3.5" />
                        {day}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Until <span className="text-destructive">*</span></Label>
                <Input type="date" min={date} max={addDays(date, 365)} value={untilDate} onChange={(e) => setUntilDate(e.target.value)} />
                <p className="text-[11px] text-muted-foreground">Up to a year ahead. Booked slots are skipped.</p>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label>Block reason <span className="text-destructive">*</span></Label>
            <Select value={reason} onValueChange={(v) => setReason(v as BlockReason)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BLOCK_REASONS.map((r) => <SelectItem key={r} value={r}>{BLOCK_REASON_LABEL[r]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Note <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Additional details about this block (admin only)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          <BlockSummary
            rows={[
              ["Ground", ground?.name ?? "—"],
              ["Date",   blockType === "recurringWeekly" ? `${formatSlotDate(date)} – ${formatSlotDate(untilDate)}` : formatSlotDate(date)],
              ...(blockType === "recurringWeekly" ? [["Days", weekdays.length ? weekdays.join(", ") : "—"] as [string, string]] : []),
              ["Slot",   slotSummary],
              ["Reason", BLOCK_REASON_LABEL[reason]],
            ]}
          />

          {needsCancel && selectedSlot?.booking && (
            <label className="flex items-start gap-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300">
              <Checkbox checked={cancelBooking} onCheckedChange={(v) => setCancelBooking(v === true)} className="mt-0.5" />
              <span>
                Cancel and refund the booking (#{selectedSlot.booking.bookingNumber}, {selectedSlot.booking.customerName})
                <span className="block text-xs opacity-80">Required to block a booked slot. The customer gets a full refund.</span>
              </span>
            </label>
          )}
          {slotUnavailable && (
            <BlockWarning>
              {selectedSlot?.status === "held" ? "A customer is paying for this slot." : `This slot is already ${selectedSlot?.status}.`}
            </BlockWarning>
          )}
          {bookedThatDay > 0 && (
            <BlockWarning>{`${bookedThatDay} booked slot${bookedThatDay === 1 ? "" : "s"} that day will be left as they are.`}</BlockWarning>
          )}

          <Button type="submit" variant="destructive" className="w-full" disabled={pending || !body || slotUnavailable || (needsCancel && !cancelBooking)}>
            <Ban className="mr-1.5 h-4 w-4" />
            {pending ? "Blocking…" : needsCancel ? "Cancel booking and block" : single ? "Block slot" : "Block slots"}
          </Button>
          <ConfirmDialog
            open={confirming}
            title={blockType === "fullDay" ? `Block all of ${formatSlotDate(date)}?` : "Block these slots every week?"}
            description={
              blockType === "fullDay"
                ? `Every free slot on ${ground?.name ?? "this ground"} that day becomes unavailable to customers. Booked slots are left as they are.`
                : `${slotSummary} on ${weekdays.join(", ")} from ${formatSlotDate(date)} to ${formatSlotDate(untilDate)} becomes unavailable to customers. Booked slots are left as they are.`
            }
            confirmLabel="Block"
            onCancel={() => setConfirming(false)}
            onConfirm={() => { setConfirming(false); if (body) submitBlock(body); }}
          />
        </form>
      </CardContent>
    </Card>
  );
}
