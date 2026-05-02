import { NextRequest, NextResponse } from "next/server";
import type { CalendarSlot, CalendarGround } from "@/types";

export const CALENDAR_GROUNDS: CalendarGround[] = [
  { id: "GR-01", name: "Green Arena",  type: "football",  color: "emerald" },
  { id: "GR-02", name: "Blue Pitch",   type: "cricket",   color: "sky"     },
  { id: "GR-03", name: "Red Court",    type: "badminton", color: "violet"  },
  { id: "GR-04", name: "Gold Tennis",  type: "tennis",    color: "rose"    },
];

// Slots per ground per day (openingTime–closingTime)
const DAILY_SLOTS = { "GR-01": 17, "GR-02": 15, "GR-03": 16, "GR-04": 14 };
export const TOTAL_DAILY_SLOTS = Object.values(DAILY_SLOTS).reduce((a, b) => a + b, 0); // 62

function mk(
  id: string, gid: string, gname: string, date: string,
  st: string, et: string, status: CalendarSlot["status"],
  cname?: string, amount?: number, adv?: number, note?: string,
): CalendarSlot {
  return { id, groundId: gid, groundName: gname, date, startTime: st, endTime: et, status, customerName: cname, amount, advancePaid: adv, note };
}

const ALL_SLOTS: CalendarSlot[] = [
  // March (prev-month overflow)
  mk("CS-042", "GR-01", "Green Arena", "2026-03-30", "09:00","10:00","booked","Rahim Uddin",1200),
  mk("CS-043", "GR-02", "Blue Pitch",  "2026-03-31", "14:00","15:00","booked","Karim Hossain",1800),
  // April
  mk("CS-001","GR-01","Green Arena","2026-04-01","10:00","11:00","booked","Rahim Uddin",1200),
  mk("CS-002","GR-02","Blue Pitch", "2026-04-01","13:00","14:00","booked","Karim Hossain",1800),
  mk("CS-003","GR-02","Blue Pitch", "2026-04-03","13:00","15:00","booked","Nasrin Akter",3600),
  mk("CS-004","GR-03","Red Court",  "2026-04-03","09:00","10:00","blocked",undefined,undefined,undefined,"Cleaning"),
  mk("CS-005","GR-01","Green Arena","2026-04-05","09:00","10:00","partial","Salam Sheikh",1200,600),
  mk("CS-006","GR-04","Gold Tennis","2026-04-05","14:00","15:00","booked","Farida Begum",900),
  mk("CS-007","GR-01","Green Arena","2026-04-07","06:00","07:00","blocked",undefined,undefined,undefined,"Maintenance"),
  mk("CS-008","GR-04","Gold Tennis","2026-04-07","10:00","11:00","booked","Jahangir Alam",900),
  mk("CS-009","GR-02","Blue Pitch", "2026-04-08","10:00","11:00","booked","Rahim Uddin",1800),
  mk("CS-010","GR-03","Red Court",  "2026-04-08","16:00","17:00","partial","Karim Hossain",600,300),
  mk("CS-011","GR-01","Green Arena","2026-04-10","08:00","09:00","booked","Nasrin Akter",1200),
  mk("CS-012","GR-02","Blue Pitch", "2026-04-10","12:00","13:00","booked","Salam Sheikh",1800),
  mk("CS-013","GR-04","Gold Tennis","2026-04-10","15:00","16:00","blocked",undefined,undefined,undefined,"Court repair"),
  mk("CS-014","GR-02","Blue Pitch", "2026-04-12","11:00","12:00","booked","Farida Begum",1800),
  mk("CS-015","GR-04","Gold Tennis","2026-04-12","15:00","16:00","booked","Jahangir Alam",900),
  mk("CS-016","GR-01","Green Arena","2026-04-12","17:00","18:00","partial","Rahim Uddin",1200,600),
  mk("CS-017","GR-01","Green Arena","2026-04-14","14:00","15:00","partial","Nasrin Akter",1200,400),
  mk("CS-018","GR-03","Red Court",  "2026-04-14","08:00","10:00","blocked",undefined,undefined,undefined,"Maintenance"),
  mk("CS-019","GR-03","Red Court",  "2026-04-15","09:00","10:00","blocked",undefined,undefined,undefined,"Deep clean"),
  mk("CS-020","GR-02","Blue Pitch", "2026-04-15","14:00","15:00","booked","Salam Sheikh",1800),
  mk("CS-021","GR-02","Blue Pitch", "2026-04-17","13:00","15:00","booked","Karim Hossain",3600),
  mk("CS-022","GR-01","Green Arena","2026-04-17","19:00","20:00","blocked",undefined,undefined,undefined,"Event setup"),
  mk("CS-023","GR-04","Gold Tennis","2026-04-19","10:00","11:00","booked","Farida Begum",900),
  mk("CS-024","GR-01","Green Arena","2026-04-19","11:00","12:00","booked","Jahangir Alam",1200),
  mk("CS-025","GR-03","Red Court",  "2026-04-19","15:00","16:00","partial","Rahim Uddin",600,300),
  mk("CS-026","GR-01","Green Arena","2026-04-21","10:00","11:00","booked","Rahim Uddin",1200),
  mk("CS-027","GR-02","Blue Pitch", "2026-04-21","13:00","14:00","partial","Karim Hossain",1800,900),
  mk("CS-028","GR-03","Red Court",  "2026-04-21","06:00","07:00","blocked",undefined,undefined,undefined,"Cleaning"),
  mk("CS-029","GR-04","Gold Tennis","2026-04-22","08:00","09:00","booked","Salam Sheikh",900),
  mk("CS-030","GR-01","Green Arena","2026-04-22","14:00","15:00","booked","Nasrin Akter",1200),
  mk("CS-031","GR-01","Green Arena","2026-04-24","09:00","10:00","booked","Farida Begum",1200),
  mk("CS-032","GR-02","Blue Pitch", "2026-04-24","11:00","12:00","booked","Jahangir Alam",1800),
  mk("CS-033","GR-02","Blue Pitch", "2026-04-24","15:00","16:00","blocked",undefined,undefined,undefined,"Net fixing"),
  mk("CS-034","GR-01","Green Arena","2026-04-26","10:00","11:00","partial","Rahim Uddin",1200,500),
  mk("CS-035","GR-03","Red Court",  "2026-04-26","13:00","14:00","booked","Karim Hossain",600),
  mk("CS-036","GR-04","Gold Tennis","2026-04-26","16:00","17:00","blocked",undefined,undefined,undefined,"Maintenance"),
  mk("CS-037","GR-02","Blue Pitch", "2026-04-28","06:00","07:00","blocked",undefined,undefined,undefined,"Pitch marking"),
  mk("CS-038","GR-01","Green Arena","2026-04-28","11:00","12:00","booked","Nasrin Akter",1200),
  mk("CS-039","GR-01","Green Arena","2026-04-30","10:00","11:00","booked","Salam Sheikh",1200),
  mk("CS-040","GR-02","Blue Pitch", "2026-04-30","11:00","12:00","booked","Farida Begum",1800),
  mk("CS-041","GR-04","Gold Tennis","2026-04-30","15:00","16:00","partial","Jahangir Alam",900,450),
  // May (next-month overflow)
  mk("CS-044","GR-01","Green Arena","2026-05-01","10:00","11:00","booked","Nasrin Akter",1200),
  mk("CS-045","GR-03","Red Court",  "2026-05-02","15:00","16:00","booked","Salam Sheikh",600),
  mk("CS-046","GR-04","Gold Tennis","2026-05-03","09:00","10:00","partial","Rahim Uddin",900,400),
];

export async function GET(req: NextRequest) {
  const year  = parseInt(req.nextUrl.searchParams.get("year")  ?? "2026");
  const month = parseInt(req.nextUrl.searchParams.get("month") ?? "4"); // 1-indexed
  const gid   = req.nextUrl.searchParams.get("groundId") ?? "all";

  const slots = ALL_SLOTS.filter((s) => {
    const [sy, sm] = s.date.split("-").map(Number);
    const near = sy === year && (sm === month - 1 || sm === month || sm === month + 1)
      || (month === 1  && sy === year - 1 && sm === 12)
      || (month === 12 && sy === year + 1 && sm === 1);
    return near && (gid === "all" || s.groundId === gid);
  });

  return NextResponse.json({ success: true, data: { slots, grounds: CALENDAR_GROUNDS } });
}
