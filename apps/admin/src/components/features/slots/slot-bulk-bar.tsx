"use client";

import { useState } from "react";
import { Ban, Unlock, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/features/confirm-dialog";
import { useBulkSlotAction, type Slot } from "@/hooks/useSlots";
import { toApiFailure } from "@/lib/api-error";
import { BLOCK_REASON_LABEL, slotTimeLabel } from "@/lib/slot-format";
import { BLOCK_REASONS, type BlockReason, type BulkSlotsResult } from "@/types/slot";

type Pending = { action: "block"; reason: BlockReason } | { action: "unblock" };

/** Actions for the slots ticked in the list. Only free slots can be blocked, only blocked ones unblocked; held and booked slots are always skipped. */
export function SlotBulkBar({ selected, onDone }: { selected: Slot[]; onDone: () => void }) {
  const bulk = useBulkSlotAction();
  const [pending, setPending] = useState<Pending | null>(null);

  const blockable = selected.filter((s) => s.status === "available");
  const unblockable = selected.filter((s) => s.status === "blocked");
  const targets = pending?.action === "block" ? blockable : unblockable;

  // One toast; failed slots are listed by time with turf-api's reason.
  function report(verb: string, res: BulkSlotsResult) {
    const what = `${verb} ${res.done} slot${res.done === 1 ? "" : "s"}`;
    if (!res.failed.length) return toast.success(what);
    const byId = new Map(selected.map((s) => [s.id, s]));
    toast.warning(`${what}; ${res.failed.length} not changed`, {
      description: (
        <ul className="mt-1 space-y-0.5">
          {res.failed.map((f) => {
            const slot = byId.get(f.id);
            return <li key={f.id}>{slot ? `${slot.groundName} ${slotTimeLabel(slot)}` : "A slot"}: {f.error}</li>;
          })}
        </ul>
      ),
      duration: 8000,
    });
  }

  function run() {
    if (!pending) return;
    const ids = targets.map((s) => s.id);
    const verb = pending.action === "block" ? "Blocked" : "Unblocked";
    bulk.mutate(
      { ids, action: pending.action, reason: pending.action === "block" ? pending.reason : undefined },
      {
        onSuccess: (res) => { report(verb, res); onDone(); },
        onError: (err) => toast.error(toApiFailure(err).error),
      },
    );
    setPending(null);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
      <span className="font-medium">{selected.length} selected</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="h-8 gap-1 text-red-600" disabled={!blockable.length || bulk.isPending}>
            <Ban className="h-3.5 w-3.5" /> Block {blockable.length || ""}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel className="text-xs">Reason</DropdownMenuLabel>
          {BLOCK_REASONS.map((r) => (
            <DropdownMenuItem key={r} onSelect={() => setPending({ action: "block", reason: r })}>
              {BLOCK_REASON_LABEL[r]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        size="sm" variant="outline" className="h-8 gap-1 text-green-600"
        disabled={!unblockable.length || bulk.isPending}
        onClick={() => setPending({ action: "unblock" })}
      >
        <Unlock className="h-3.5 w-3.5" /> Unblock {unblockable.length || ""}
      </Button>
      <Button size="sm" variant="ghost" className="ml-auto h-8 gap-1 text-muted-foreground" onClick={onDone}>
        <X className="h-3.5 w-3.5" /> Clear
      </Button>

      <ConfirmDialog
        open={!!pending}
        title={pending?.action === "block" ? `Block ${targets.length} slot${targets.length === 1 ? "" : "s"}?` : `Unblock ${targets.length} slot${targets.length === 1 ? "" : "s"}?`}
        description={
          pending?.action === "block"
            ? `They become unavailable to customers (reason: ${BLOCK_REASON_LABEL[pending.reason]}).${selected.length > targets.length ? " Selected slots that aren't free are skipped." : ""}`
            : `They become bookable straight away.${selected.length > targets.length ? " Selected slots that aren't blocked are skipped." : ""}`
        }
        confirmLabel={pending?.action === "block" ? "Block" : "Unblock"}
        destructive={pending?.action === "block"}
        onCancel={() => setPending(null)}
        onConfirm={run}
      />
    </div>
  );
}
