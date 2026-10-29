"use client";

import { Loader2 } from "lucide-react";
import {
  Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSlotHistory } from "@/hooks/useSlots";
import { toApiFailure } from "@/lib/api-error";
import {
  BLOCK_REASON_LABEL, SLOT_EVENT_LABEL, formatEventTime, formatSlotDate, slotTimeLabel,
} from "@/lib/slot-format";
import type { Slot, SlotEventAction } from "@/types/slot";

const DOT: Record<SlotEventAction, string> = {
  block: "bg-red-500",
  close: "bg-amber-500",
  unblock: "bg-green-500",
  reopen: "bg-green-500",
};

/** Who blocked and unblocked this slot, and when (newest first). */
export function SlotHistorySheet({ slot, onClose }: { slot: Slot | null; onClose: () => void }) {
  const history = useSlotHistory(slot?.id);

  return (
    <Sheet open={!!slot} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle>Slot history</SheetTitle>
          <SheetDescription>
            {slot ? `${slot.groundName} · ${formatSlotDate(slot.date)} · ${slotTimeLabel(slot)}` : ""}
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          {history.isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : history.isError ? (
            <p className="text-sm text-destructive">{toApiFailure(history.error).error}</p>
          ) : !history.data?.length ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No changes yet. This slot has never been blocked.
            </p>
          ) : (
            <ol className="relative space-y-5 border-l pl-5">
              {history.data.map((e) => (
                <li key={e.id} className="relative">
                  <span className={cn("absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-background", DOT[e.action])} />
                  <p className="text-sm font-medium">
                    {SLOT_EVENT_LABEL[e.action]}
                    {e.reason && <span className="font-normal text-muted-foreground"> · {BLOCK_REASON_LABEL[e.reason]}</span>}
                  </p>
                  {e.note && <p className="mt-0.5 text-sm text-muted-foreground">“{e.note}”</p>}
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {e.user ? e.user.name : "A removed staff account"} · {formatEventTime(e.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
