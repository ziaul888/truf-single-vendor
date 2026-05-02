import { NextResponse } from "next/server";

export interface PricingTier {
  pricePerHour: number;
  from: string;
  to: string;
}

export const grounds = [
  {
    id: "GR-01",
    branchId: "BR-01",
    name: "Green Arena",
    type: "football",
    size: "100×60 m",
    capacity: 22,
    photos: [
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=800&h=450&q=80",
    ],
    amenities: ["Floodlights", "Parking", "Changing Room", "First Aid"],
    pricePerHour: 1200,
    peakPricing: { pricePerHour: 1500, from: "17:00", to: "23:00" },
    offPeakPricing: { pricePerHour: 1000, from: "06:00", to: "17:00" },
    openingTime: "06:00",
    closingTime: "23:00",
    isActive: true,
    todayBookings: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "GR-02",
    branchId: "BR-01",
    name: "Blue Pitch",
    type: "cricket",
    size: "130×70 m",
    capacity: 30,
    photos: [
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&h=450&q=80",
    ],
    amenities: ["Floodlights", "Scoreboard", "Pavilion", "Parking"],
    pricePerHour: 1800,
    peakPricing: { pricePerHour: 2200, from: "16:00", to: "22:00" },
    offPeakPricing: { pricePerHour: 1500, from: "07:00", to: "16:00" },
    openingTime: "07:00",
    closingTime: "22:00",
    isActive: true,
    todayBookings: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "GR-03",
    branchId: "BR-01",
    name: "Red Court",
    type: "badminton",
    size: "13×6 m",
    capacity: 4,
    photos: [
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&h=450&q=80",
    ],
    amenities: ["AC", "Lighting", "Equipment Rental"],
    pricePerHour: 600,
    peakPricing: { pricePerHour: 800, from: "16:00", to: "22:00" },
    offPeakPricing: { pricePerHour: 500, from: "06:00", to: "16:00" },
    openingTime: "06:00",
    closingTime: "22:00",
    isActive: true,
    todayBookings: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "GR-04",
    branchId: "BR-01",
    name: "Gold Tennis",
    type: "tennis",
    size: "24×11 m",
    capacity: 4,
    photos: [
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&h=450&q=80",
    ],
    amenities: ["Floodlights", "Equipment Rental", "Seating"],
    pricePerHour: 900,
    peakPricing: { pricePerHour: 1200, from: "17:00", to: "21:00" },
    offPeakPricing: { pricePerHour: 700, from: "07:00", to: "17:00" },
    openingTime: "07:00",
    closingTime: "21:00",
    isActive: true,
    todayBookings: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "GR-05",
    branchId: "BR-01",
    name: "Sky Court",
    type: "basketball",
    size: "28×15 m",
    capacity: 10,
    photos: [],
    amenities: ["Floodlights", "Scoreboard", "Changing Room"],
    pricePerHour: 1000,
    peakPricing: { pricePerHour: 1300, from: "17:00", to: "22:00" },
    offPeakPricing: { pricePerHour: 800, from: "07:00", to: "17:00" },
    openingTime: "07:00",
    closingTime: "22:00",
    isActive: false,
    todayBookings: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({ success: true, data: grounds });
}

export async function POST(req: Request) {
  const body = await req.json();
  const id = `GR-${String(grounds.length + 1).padStart(2, "0")}`;
  const newGround = {
    id,
    branchId: "BR-01",
    photos: [],
    todayBookings: 0,
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  grounds.push(newGround);
  return NextResponse.json({ success: true, data: newGround }, { status: 201 });
}
