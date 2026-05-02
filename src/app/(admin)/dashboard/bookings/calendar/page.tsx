"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MonthGrid }  from "@/components/features/booking-calendar/month-grid";
import { WeekGrid }   from "@/components/features/booking-calendar/week-grid";
import { DayPanel }   from "@/components/features/booking-calendar/day-panel";
import { TOTAL_DAILY_SLOTS } from "@/app/api/bookings/calendar/route";
import type { CalendarSlot, CalendarGround } from "@/types";
import {
  ChevronLeft, ChevronRight, List, CalendarDays,
  CheckCircle2, CalendarClock, Ban, Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

type View = "month" | "week" | "day";

const MONTH_NAMES = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

const today     = new Date();
const todayStr  = today.toISOString().split("T")[0];

function formatNavLabel(view: View, date: Date) {
  if (view === "month") return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
  if (view === "week") {
    const dow = (date.getDay() + 6) % 7;
    const mon = new Date(date); mon.setDate(date.getDate() - dow);
    const sun = new Date(mon);  sun.setDate(mon.getDate() + 6);
    const monStr = mon.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const sunStr = sun.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${monStr} – ${sunStr}`;
  }
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function navigate(view: View, date: Date, dir: 1 | -1): Date {
  const d = new Date(date);
  if (view === "month") d.setMonth(d.getMonth() + dir);
  else if (view === "week") d.setDate(d.getDate() + dir * 7);
  else d.setDate(d.getDate() + dir);
  return d;
}

export default function CalendarPage() {
  const [view,         setView]         = useState<View>("month");
  const [currentDate,  setCurrentDate]  = useState(today);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [groundFilter, setGroundFilter] = useState("all");

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data, isLoading } = useQuery<{ slots: CalendarSlot[]; grounds: CalendarGround[] }>({
    queryKey: ["calendar", year, month, groundFilter],
    queryFn: async () => {
      const res  = await fetch(`/api/bookings/calendar?year=${year}&month=${month}&groundId=${groundFilter}`);
      const json = await res.json();
      return json.data;
    },
  });

  const slots   = data?.slots   ?? [];
  const grounds = data?.grounds ?? [];

  // Stats — relative to today
  const todaySlots    = slots.filter((s) => s.date === todayStr);
  const bookedToday   = todaySlots.filter((s) => s.status === "booked").length;
  const occupiedToday = todaySlots.length;
  const availToday    = Math.max(0, TOTAL_DAILY_SLOTS - occupiedToday);
  const blockedMonth  = slots.filter((s) => s.status === "blocked").length;
  const partialAll    = slots.filter((s) => s.status === "partial").length;

  const stats = useMemo(() => [
    { label: "Booked Today",     value: bookedToday,  icon: CheckCircle2,  ring: "ring-green-500/20",  bg: "bg-green-100  dark:bg-green-900/30",  text: "text-green-700  dark:text-green-300" },
    { label: "Available Today",  value: availToday,   icon: CalendarClock, ring: "ring-blue-500/20",   bg: "bg-blue-100   dark:bg-blue-900/30",   text: "text-blue-700   dark:text-blue-300"  },
    { label: "Blocked (month)",  value: blockedMonth, icon: Ban,           ring: "ring-gray-500/20",   bg: "bg-gray-100   dark:bg-gray-800",      text: "text-gray-600   dark:text-gray-400"  },
    { label: "Partial Payment",  value: partialAll,   icon: Wallet,        ring: "ring-amber-500/20",  bg: "bg-amber-100  dark:bg-amber-900/30",  text: "text-amber-700  dark:text-amber-300" },
  ], [bookedToday, availToday, blockedMonth, partialAll]);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Booking Calendar</h1>
          <p className="text-sm text-muted-foreground">Visual overview of all ground bookings</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/bookings">
            <List className="mr-1.5 h-4 w-4" /> List View
          </Link>
        </Button>
      </div>

      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Ground filter */}
        <Select value={groundFilter} onValueChange={(v) => { setGroundFilter(v); }}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="All Grounds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grounds</SelectItem>
            {grounds.map((g) => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setCurrentDate(navigate(view, currentDate, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <button
            type="button"
            className="min-w-[160px] text-center text-sm font-semibold hover:text-primary transition-colors"
            onClick={() => setCurrentDate(today)}
          >
            {formatNavLabel(view, currentDate)}
          </button>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setCurrentDate(navigate(view, currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* View switcher */}
        <div className="flex rounded-lg border p-0.5 gap-0.5">
          {(["month", "week", "day"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all",
                view === v ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, ring, bg, text }) => (
          <div key={label} className={cn("flex items-center gap-3 rounded-xl border p-3.5 ring-1", ring)}>
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", bg)}>
              <Icon className={cn("h-4 w-4", text)} />
            </div>
            <div>
              <p className="text-xl font-bold tabular-nums">{isLoading ? "—" : value}</p>
              <p className="text-xs text-muted-foreground leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar body */}
      <div className="flex gap-5 items-start">
        {/* Main grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="h-[520px] animate-pulse rounded-xl bg-muted" />
          ) : view === "month" ? (
            <MonthGrid
              slots={slots}
              selectedDate={selectedDate}
              currentMonth={currentDate}
              totalDailySlots={TOTAL_DAILY_SLOTS}
              onSelectDate={setSelectedDate}
            />
          ) : view === "week" ? (
            <WeekGrid
              slots={slots}
              selectedDate={selectedDate}
              currentWeekDate={currentDate}
              onSelectDate={(d) => { setSelectedDate(d); setCurrentDate(new Date(d + "T00:00:00")); }}
            />
          ) : (
            /* Day view — reuse DayPanel full-width */
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b">
                <CalendarDays className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="font-semibold text-base">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </h2>
                  <p className="text-sm text-muted-foreground">All slot activity for this day</p>
                </div>
              </div>
              <DayPanel
                slots={slots}
                selectedDate={selectedDate}
                grounds={grounds}
                groundFilter={groundFilter}
                totalDailySlots={TOTAL_DAILY_SLOTS}
                onGroundFilter={setGroundFilter}
              />
            </div>
          )}
        </div>

        {/* Right sidebar — hidden on day view */}
        {view !== "day" && (
          <div className="w-64 xl:w-72 shrink-0 hidden lg:flex flex-col gap-0">
            <DayPanel
              slots={slots}
              selectedDate={selectedDate}
              grounds={grounds}
              groundFilter={groundFilter}
              totalDailySlots={TOTAL_DAILY_SLOTS}
              onGroundFilter={(id) => { setGroundFilter(id); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
