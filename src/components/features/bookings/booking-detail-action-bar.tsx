"use client";

import { Button } from "@/components/ui/button";
import { MobileActionBar } from "@/components/features/mobile-action-bar";
import type { BookingDetail } from "@/types/booking";
import { Banknote, CheckCircle2, Undo2, UserX, XCircle } from "lucide-react";
import { canCollectPayment, canMarkNoShow, isAwaitingWalletVerification, isCancellable } from "./booking-status-helpers";

export type DetailAction = "confirm" | "collect" | "noShow" | "undoNoShow" | "cancel";

/** The detail page's main actions for this booking, in the order the bar shows them. */
export function detailActions(booking: BookingDetail, canConfirm: boolean): DetailAction[] {
  const actions: DetailAction[] = [];
  if (canConfirm) actions.push("confirm");
  if (canCollectPayment(booking)) actions.push("collect");
  if (canMarkNoShow(booking)) actions.push("noShow");
  if (booking.status === "no_show") actions.push("undoNoShow");
  if (isCancellable(booking)) actions.push("cancel");
  return actions;
}

interface BookingDetailActionBarProps {
  booking: BookingDetail;
  actions: DetailAction[];
  /** Opens the same dialog as the header and Quick Actions buttons. */
  onAction: (action: DetailAction) => void;
}

/**
 * Below lg the Quick Actions card sits under the ground and the whole activity timeline,
 * so the main actions are pinned to the bottom of the screen as well.
 */
export function BookingDetailActionBar({ booking, actions, onAction }: BookingDetailActionBarProps) {
  if (actions.length === 0) return null;
  const label: Record<DetailAction, React.ReactNode> = {
    confirm: <><CheckCircle2 className="h-4 w-4" />{isAwaitingWalletVerification(booking) ? "Verify" : "Confirm"}</>,
    collect: <><Banknote className="h-4 w-4" />Collect</>,
    noShow: <><UserX className="h-4 w-4" />No-show</>,
    undoNoShow: <><Undo2 className="h-4 w-4" />Undo No-show</>,
    cancel: <><XCircle className="h-4 w-4" />{booking.paid > 0 ? "Cancel & Refund" : "Cancel"}</>,
  };
  const variant = (a: DetailAction) => (a === "cancel" ? "destructive" : a === "confirm" ? "default" : "outline");

  return (
    // An odd last button takes the full row.
    <MobileActionBar className="grid grid-cols-2 gap-2 [&>:last-child:nth-child(odd)]:col-span-2">
      {actions.map((a) => (
        <Button key={a} variant={variant(a)} className={a === "confirm" ? "h-11 bg-green-600 text-white hover:bg-green-700" : "h-11"}
          onClick={() => onAction(a)}>
          {label[a]}
        </Button>
      ))}
    </MobileActionBar>
  );
}
