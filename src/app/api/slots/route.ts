import { NextRequest, NextResponse } from "next/server";

export type SlotStatus = "available" | "booked" | "blocked" | "partial";
export type SlotDuration = "30 min" | "1 hour" | "2 hours" | "Custom";

export interface Slot {
  id: string;
  groundId: string;
  ground: string;
  groundType: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: SlotDuration;
  customer?: string;
  bookingId?: string;
  price: number;
  status: SlotStatus;
  blockReason?: string;
}

// Mutable in-memory store
export const slots: Slot[] = [
  // Green Arena — 2026-04-21
  { id: "SL-001", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "06:00", endTime: "07:00", duration: "1 hour",  price: 1000, status: "available" },
  { id: "SL-002", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "07:00", endTime: "08:00", duration: "1 hour",  price: 1000, status: "available" },
  { id: "SL-003", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "08:00", endTime: "10:00", duration: "2 hours", price: 2000, status: "booked",    customer: "Rahim Khan",   bookingId: "BKG-0042" },
  { id: "SL-004", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "10:00", endTime: "10:30", duration: "30 min",  price: 500,  status: "available" },
  { id: "SL-005", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "10:30", endTime: "11:00", duration: "30 min",  price: 500,  status: "available" },
  { id: "SL-006", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "11:00", endTime: "12:00", duration: "1 hour",  price: 1000, status: "available" },
  { id: "SL-007", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "12:00", endTime: "13:00", duration: "1 hour",  price: 1000, status: "booked",    customer: "Kamal H.",     bookingId: "BKG-0041" },
  { id: "SL-008", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "13:00", endTime: "14:00", duration: "1 hour",  price: 1000, status: "available" },
  { id: "SL-009", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "14:00", endTime: "15:00", duration: "1 hour",  price: 1000, status: "partial",    customer: "Nadia R.",     bookingId: "BKG-0040" },
  { id: "SL-010", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "15:00", endTime: "16:00", duration: "1 hour",  price: 1000, status: "available" },
  { id: "SL-011", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "16:00", endTime: "17:00", duration: "1 hour",  price: 1000, status: "blocked",    blockReason: "Maintenance" },
  { id: "SL-012", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "17:00", endTime: "18:00", duration: "1 hour",  price: 1500, status: "booked",    customer: "Rafiq Ahmed",  bookingId: "BKG-0039" },
  { id: "SL-013", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "18:00", endTime: "19:00", duration: "1 hour",  price: 1500, status: "available" },
  { id: "SL-014", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "19:00", endTime: "20:00", duration: "1 hour",  price: 1500, status: "booked",    customer: "Jasmin Begum", bookingId: "BKG-0038" },
  { id: "SL-015", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "20:00", endTime: "21:00", duration: "1 hour",  price: 1500, status: "blocked",    blockReason: "Reserved" },
  { id: "SL-016", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "21:00", endTime: "22:00", duration: "1 hour",  price: 1500, status: "partial",    customer: "Tariq Miah",   bookingId: "BKG-0037" },
  { id: "SL-017", groundId: "GR-01", ground: "Green Arena", groundType: "football", date: "2026-04-21", startTime: "22:00", endTime: "23:00", duration: "1 hour",  price: 1500, status: "available" },
  // Blue Pitch — 2026-04-21
  { id: "SL-018", groundId: "GR-02", ground: "Blue Pitch",  groundType: "cricket",  date: "2026-04-21", startTime: "07:00", endTime: "08:00", duration: "1 hour",  price: 1500, status: "available" },
  { id: "SL-019", groundId: "GR-02", ground: "Blue Pitch",  groundType: "cricket",  date: "2026-04-21", startTime: "08:00", endTime: "10:00", duration: "2 hours", price: 3000, status: "booked",    customer: "Humayun K.",   bookingId: "BKG-0036" },
  { id: "SL-020", groundId: "GR-02", ground: "Blue Pitch",  groundType: "cricket",  date: "2026-04-21", startTime: "10:00", endTime: "12:00", duration: "2 hours", price: 3000, status: "available" },
  { id: "SL-021", groundId: "GR-02", ground: "Blue Pitch",  groundType: "cricket",  date: "2026-04-21", startTime: "12:00", endTime: "13:00", duration: "1 hour",  price: 1500, status: "blocked",    blockReason: "Maintenance" },
  { id: "SL-022", groundId: "GR-02", ground: "Blue Pitch",  groundType: "cricket",  date: "2026-04-21", startTime: "13:00", endTime: "14:00", duration: "1 hour",  price: 1500, status: "booked",    customer: "Farhan M.",    bookingId: "BKG-0035" },
  { id: "SL-023", groundId: "GR-02", ground: "Blue Pitch",  groundType: "cricket",  date: "2026-04-21", startTime: "17:00", endTime: "18:00", duration: "1 hour",  price: 2200, status: "partial",    customer: "Mizanur R.",   bookingId: "BKG-0034" },
  // Red Court — 2026-04-21
  { id: "SL-024", groundId: "GR-03", ground: "Red Court",   groundType: "badminton",date: "2026-04-21", startTime: "06:00", endTime: "06:30", duration: "30 min",  price: 400,  status: "available" },
  { id: "SL-025", groundId: "GR-03", ground: "Red Court",   groundType: "badminton",date: "2026-04-21", startTime: "06:30", endTime: "07:00", duration: "30 min",  price: 400,  status: "booked",    customer: "Farhana Y.",   bookingId: "BKG-0033" },
  { id: "SL-026", groundId: "GR-03", ground: "Red Court",   groundType: "badminton",date: "2026-04-21", startTime: "07:00", endTime: "08:00", duration: "1 hour",  price: 500,  status: "available" },
  { id: "SL-027", groundId: "GR-03", ground: "Red Court",   groundType: "badminton",date: "2026-04-21", startTime: "16:00", endTime: "17:00", duration: "1 hour",  price: 800,  status: "blocked",    blockReason: "Reserved" },
  { id: "SL-028", groundId: "GR-03", ground: "Red Court",   groundType: "badminton",date: "2026-04-21", startTime: "17:00", endTime: "18:00", duration: "1 hour",  price: 800,  status: "booked",    customer: "Rokeya S.",    bookingId: "BKG-0032" },
  // Gold Tennis — 2026-04-21
  { id: "SL-029", groundId: "GR-04", ground: "Gold Tennis", groundType: "tennis",   date: "2026-04-21", startTime: "07:00", endTime: "08:00", duration: "1 hour",  price: 700,  status: "available" },
  { id: "SL-030", groundId: "GR-04", ground: "Gold Tennis", groundType: "tennis",   date: "2026-04-21", startTime: "08:00", endTime: "09:00", duration: "1 hour",  price: 700,  status: "booked",    customer: "Sumaiya I.",   bookingId: "BKG-0031" },
  { id: "SL-031", groundId: "GR-04", ground: "Gold Tennis", groundType: "tennis",   date: "2026-04-21", startTime: "17:00", endTime: "18:00", duration: "1 hour",  price: 1200, status: "partial",    customer: "Morsheda A.",  bookingId: "BKG-0030" },
];

const PAGE_SIZE = 7;

function fmt12(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12    = h % 12 || 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2,"0")} ${suffix}`;
}

export function slotLabel(s: Slot) {
  return `${fmt12(s.startTime)}–${fmt12(s.endTime)}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const groundId = searchParams.get("groundId") ?? "all";
  const date     = searchParams.get("date")     ?? "2026-04-21";
  const status   = searchParams.get("status")   ?? "all";
  const duration = searchParams.get("duration") ?? "all";
  const page     = parseInt(searchParams.get("page") ?? "1", 10);

  let filtered = slots.filter((s) => {
    if (groundId !== "all" && s.groundId !== groundId) return false;
    if (s.date !== date)                                return false;
    if (status  !== "all" && s.status   !== status)    return false;
    if (duration !== "all" && s.duration !== duration) return false;
    return true;
  });

  filtered = filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));

  const total     = filtered.length;
  const pageSlots = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const allForDate = slots.filter((s) => s.date === date && (groundId === "all" || s.groundId === groundId));

  const stats = {
    total:     allForDate.length,
    available: allForDate.filter((s) => s.status === "available").length,
    booked:    allForDate.filter((s) => s.status === "booked").length,
    blocked:   allForDate.filter((s) => s.status === "blocked").length,
    partial:   allForDate.filter((s) => s.status === "partial").length,
  };

  return NextResponse.json({ success: true, data: { slots: pageSlots, total, page, stats } });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "generate") {
    const { groundId, ground, groundType, fromDate, toDate, duration, skipExisting } = body;
    const from = new Date(fromDate);
    const to   = new Date(toDate);
    let generated = 0;
    let skipped   = 0;

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const existing = slots.filter((s) => s.groundId === groundId && s.date === dateStr);

      if (skipExisting && existing.length > 0) { skipped += existing.length; continue; }

      const durationMin = duration === "30 min" ? 30 : duration === "2 hours" ? 120 : 60;
      const newSlots: Slot[] = [];
      let hour = 6, min = 0;

      while (hour < 23) {
        const start = `${String(hour).padStart(2,"0")}:${String(min).padStart(2,"0")}`;
        const totalMin = hour * 60 + min + durationMin;
        const endH = Math.floor(totalMin / 60);
        const endM = totalMin % 60;
        if (endH >= 23) break;
        const end   = `${String(endH).padStart(2,"0")}:${String(endM).padStart(2,"0")}`;
        const idx   = slots.length + newSlots.length + 1;
        const exists = existing.some((s) => s.startTime === start);
        if (skipExisting && exists) { skipped++; }
        else {
          newSlots.push({ id: `SL-${String(idx).padStart(3,"0")}`, groundId, ground, groundType, date: dateStr, startTime: start, endTime: end, duration, price: 1000, status: "available" });
          generated++;
        }
        min += durationMin;
        hour = Math.floor((hour * 60 + min) / 60);
        min  = (hour * 60 + min) % 60 - hour * 60 < 0 ? 0 : (6 * 60 + min * 0) % 60;
        const total2 = (endH * 60 + endM);
        hour = Math.floor(total2 / 60);
        min  = total2 % 60;
      }
      slots.push(...newSlots);
    }

    return NextResponse.json({ success: true, data: { generated, skipped } });
  }

  if (action === "block") {
    const { slotId, reason, note } = body;
    const idx = slots.findIndex((s) => s.id === slotId);
    if (idx === -1) return NextResponse.json({ success: false, error: "Slot not found" }, { status: 404 });
    const wasBooked = slots[idx].status === "booked" || slots[idx].status === "partial";
    slots[idx] = { ...slots[idx], status: "blocked", blockReason: reason, customer: undefined, bookingId: undefined };
    return NextResponse.json({ success: true, data: { slot: slots[idx], cancelledBooking: wasBooked } });
  }

  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
}
