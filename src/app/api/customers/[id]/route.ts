import { NextRequest, NextResponse } from "next/server";
import { customers } from "../route";

export interface BookingRecord {
  id: string;
  date: string;
  ground: string;
  slot: string;
  amount: number;
  paymentStatus: "paid" | "partial" | "pending" | "refunded";
  bookingStatus: "confirmed" | "completed" | "cancelled";
}

export interface TimelineEvent {
  color: "amber" | "green" | "red" | "blue";
  title: string;
  desc: string;
}

export interface DuePayment {
  bookingId: string;
  amount: number;
  dueDate: string;
}

const GROUNDS   = ["Green Arena", "Blue Pitch", "Red Court", "Gold Tennis", "Sky Court"];
const SLOTS     = ["6–8 AM", "8–10 AM", "10 AM–12 PM", "2–4 PM", "4–6 PM", "6–8 PM"];
const AMOUNTS   = [1200, 1800, 2400, 900, 3000, 1500, 4000, 2000];

const specific: Record<string, { bookingsList: BookingRecord[]; timeline: TimelineEvent[]; duePayments: DuePayment[]; favoriteGround: string; adminNote: string }> = {
  "CU-01": {
    bookingsList: [
      { id: "BKG-0042", date: "2026-04-20", ground: "Green Arena", slot: "6–8 AM",   amount: 3000, paymentStatus: "partial",  bookingStatus: "confirmed"  },
      { id: "BKG-0038", date: "2026-04-15", ground: "Green Arena", slot: "7–9 AM",   amount: 3000, paymentStatus: "pending",  bookingStatus: "confirmed"  },
      { id: "BKG-0031", date: "2026-04-10", ground: "Sky Court",   slot: "6–8 AM",   amount: 4000, paymentStatus: "paid",     bookingStatus: "completed"  },
      { id: "BKG-0024", date: "2026-04-03", ground: "Green Arena", slot: "6–8 AM",   amount: 3000, paymentStatus: "refunded", bookingStatus: "cancelled"  },
      { id: "BKG-0018", date: "2026-03-25", ground: "Green Arena", slot: "8–10 AM",  amount: 2000, paymentStatus: "paid",     bookingStatus: "completed"  },
    ],
    timeline: [
      { color: "amber", title: "Partial payment",   desc: "20 Apr · #BKG-0042"          },
      { color: "green", title: "Booking confirmed",  desc: "15 Apr · Green Arena"         },
      { color: "green", title: "Booking confirmed",  desc: "10 Apr · Sky Court"           },
      { color: "red",   title: "Booking cancelled",  desc: "3 Apr · Refunded"             },
      { color: "blue",  title: "Customer created",   desc: "Jan 2024 · via portal"        },
    ],
    duePayments: [{ bookingId: "BKG-20240420-0042", amount: 2000, dueDate: "2026-04-25" }],
    favoriteGround: "Green Arena",
    adminNote: "Prefers morning slots, usually books 2 hrs",
  },
};

function buildDetail(id: string, bookingCount: number, lastBooking: string, since: string, dueAmount: number) {
  const fav   = GROUNDS[bookingCount % GROUNDS.length];
  const base  = new Date(lastBooking).getTime();
  const n     = Math.min(5, bookingCount);

  const bookingsList: BookingRecord[] = Array.from({ length: n }, (_, i) => {
    const d = new Date(base - i * 7 * 86400000).toISOString().split("T")[0];
    const payStatus: BookingRecord["paymentStatus"] = i === 0 && dueAmount > 0 ? "partial" : i === 3 ? "refunded" : "paid";
    const bkStatus: BookingRecord["bookingStatus"] = i === 3 ? "cancelled" : "completed";
    return {
      id: `BKG-${String(9000 - bookingCount * 3 + i).padStart(4, "0")}`,
      date: d,
      ground: GROUNDS[(bookingCount + i) % GROUNDS.length],
      slot:   SLOTS[i % SLOTS.length],
      amount: AMOUNTS[(bookingCount + i) % AMOUNTS.length],
      paymentStatus: payStatus,
      bookingStatus: bkStatus,
    };
  });

  const timeline: TimelineEvent[] = [
    ...(dueAmount > 0 ? [{ color: "amber" as const, title: "Partial payment", desc: `${new Date(lastBooking).toLocaleDateString("en-US", { day: "numeric", month: "short" })} · latest booking` }] : []),
    { color: "green", title: "Booking confirmed", desc: `${new Date(lastBooking).toLocaleDateString("en-US", { day: "numeric", month: "short" })} · ${fav}` },
    { color: "blue",  title: "Customer created",  desc: `${new Date(since).toLocaleDateString("en-US", { month: "short", year: "numeric" })} · via portal` },
  ];

  const duePayments: DuePayment[] = dueAmount > 0
    ? [{ bookingId: `BKG-${Date.now().toString().slice(-8)}`, amount: dueAmount, dueDate: new Date(new Date(lastBooking).getTime() + 5 * 86400000).toISOString().split("T")[0] }]
    : [];

  return { bookingsList, timeline, duePayments, favoriteGround: fav, adminNote: "" };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = customers.find((c) => c.id === id);
  if (!customer) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const detail = specific[id] ?? buildDetail(id, customer.bookings, customer.lastBooking, customer.since, customer.dueAmount);
  return NextResponse.json({ success: true, data: { ...customer, ...detail } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  Object.assign(customers[idx], body, { id });
  return NextResponse.json({ success: true, data: customers[idx] });
}
