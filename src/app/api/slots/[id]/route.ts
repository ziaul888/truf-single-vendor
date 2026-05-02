import { NextRequest, NextResponse } from "next/server";
import { slots } from "../route";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params;
  const body    = await req.json();
  const idx     = slots.findIndex((s) => s.id === id);
  if (idx === -1) return NextResponse.json({ success: false, error: "Slot not found" }, { status: 404 });

  const { status, blockReason } = body;
  if (status === "blocked") {
    const wasBooked = slots[idx].status === "booked" || slots[idx].status === "partial";
    slots[idx] = { ...slots[idx], status: "blocked", blockReason: blockReason ?? "Admin", customer: undefined, bookingId: undefined };
    return NextResponse.json({ success: true, data: { slot: slots[idx], cancelledBooking: wasBooked } });
  }
  if (status === "available") {
    slots[idx] = { ...slots[idx], status: "available", blockReason: undefined };
    return NextResponse.json({ success: true, data: { slot: slots[idx] } });
  }
  return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
}
