import { NextRequest, NextResponse } from "next/server";
import { grounds } from "../route";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ground = grounds.find((g) => g.id === id);
  if (!ground) {
    return NextResponse.json({ success: false, error: "Ground not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: ground });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const ground = grounds.find((g) => g.id === id);
  if (!ground) {
    return NextResponse.json({ success: false, error: "Ground not found" }, { status: 404 });
  }
  if (typeof body.isActive === "boolean") {
    ground.isActive = body.isActive;
    ground.updatedAt = new Date().toISOString();
  }
  return NextResponse.json({ success: true, data: ground });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const idx = grounds.findIndex((g) => g.id === id);
  if (idx === -1) {
    return NextResponse.json({ success: false, error: "Ground not found" }, { status: 404 });
  }

  const existing = grounds[idx];
  const updated = {
    ...existing,
    name:        body.name        ?? existing.name,
    type:        body.type        ?? existing.type,
    capacity:    body.capacity    ?? existing.capacity,
    description: body.description ?? "",
    amenities:   body.amenities   ?? existing.amenities,
    openingTime: body.openingTime ?? existing.openingTime,
    closingTime: body.closingTime ?? existing.closingTime,
    isActive:    body.isActive    ?? existing.isActive,
    peakPricing: {
      pricePerHour: body.peakPrice ?? existing.peakPricing.pricePerHour,
      from: body.peakRanges?.[0]?.from ?? existing.peakPricing.from,
      to:   body.peakRanges?.[0]?.to   ?? existing.peakPricing.to,
    },
    offPeakPricing: {
      pricePerHour: body.offPeakPrice ?? existing.offPeakPricing.pricePerHour,
      from: existing.offPeakPricing.from,
      to:   existing.offPeakPricing.to,
    },
    updatedAt: new Date().toISOString(),
  };

  grounds[idx] = updated;
  return NextResponse.json({ success: true, data: updated });
}
