import { NextResponse } from "next/server";

const upcoming = [
  {
    id: "BK-001",
    customerId: "CU-01",
    groundId: "Green Arena",
    date: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    startTime: "10:00",
    endTime: "11:00",
    duration: 1,
    amount: 1200,
    status: "confirmed",
    paymentStatus: "paid",
  },
  {
    id: "BK-002",
    customerId: "CU-02",
    groundId: "Blue Pitch",
    date: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    startTime: "13:00",
    endTime: "15:00",
    duration: 2,
    amount: 2400,
    status: "pending",
    paymentStatus: "pending",
  },
  {
    id: "BK-003",
    customerId: "CU-03",
    groundId: "Red Court",
    date: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    startTime: "16:00",
    endTime: "17:00",
    duration: 1,
    amount: 900,
    status: "confirmed",
    paymentStatus: "paid",
  },
  {
    id: "BK-004",
    customerId: "CU-04",
    groundId: "Green Arena",
    date: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    startTime: "19:00",
    endTime: "21:00",
    duration: 2,
    amount: 2400,
    status: "confirmed",
    paymentStatus: "paid",
  },
];

export async function GET() {
  return NextResponse.json({ success: true, data: upcoming });
}
