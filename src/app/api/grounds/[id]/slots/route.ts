import { NextRequest, NextResponse } from "next/server";

const groundSchedules: Record<string, { openingTime: string; closingTime: string }> = {
  "GR-01": { openingTime: "06:00", closingTime: "23:00" },
  "GR-02": { openingTime: "07:00", closingTime: "22:00" },
  "GR-03": { openingTime: "06:00", closingTime: "22:00" },
  "GR-04": { openingTime: "07:00", closingTime: "21:00" },
};

const takenSlots = new Set([
  "GR-01:10:00", "GR-01:14:00", "GR-01:19:00",
  "GR-02:13:00", "GR-02:14:00",
  "GR-03:16:00",
  "GR-04:08:00",
]);

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: "available" | "taken";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const schedule = groundSchedules[id];

  if (!schedule) {
    return NextResponse.json({ success: false, error: "Ground not found" }, { status: 404 });
  }

  const [openH] = schedule.openingTime.split(":").map(Number);
  const [closeH] = schedule.closingTime.split(":").map(Number);

  const slots: TimeSlot[] = Array.from({ length: closeH - openH }, (_, i) => {
    const h = openH + i;
    const start = `${String(h).padStart(2, "0")}:00`;
    const end = `${String(h + 1).padStart(2, "0")}:00`;
    return {
      id: `${id}-${start}`,
      startTime: start,
      endTime: end,
      status: takenSlots.has(`${id}:${start}`) ? "taken" : "available",
    };
  });

  return NextResponse.json({ success: true, data: slots });
}
