"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Ban, Unlock, CalendarRange } from "lucide-react";

const LEGEND = [
  { color: "bg-blue-500",  label: "Available" },
  { color: "bg-green-500", label: "Booked" },
  { color: "bg-amber-400", label: "Partial payment" },
  { color: "bg-zinc-400",  label: "Blocked" },
];

const RULES = [
  "Slots auto-price based on peak hours",
  "Booked slots cannot be deleted",
  "Blocking a booked slot cancels booking",
  "Unblocking reopens slot instantly",
  "Custom slots don't overlap hourly slots",
  "Skip existing prevents duplicates",
];

export function SlotSidebar() {
  return (
    <div className="space-y-4">
      {/* Legend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Legend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {LEGEND.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-sm">
              <span className={`h-3 w-3 rounded-sm shrink-0 ${color}`} />
              {label}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ground info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Ground info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            ["Ground",    "Green Arena"],
            ["Type",      "Football"],
            ["Hours",     "6AM – 11PM"],
            ["Slots/day", "17 slots"],
            ["Peak price",    "৳ 1,500/hr"],
            ["Off-peak price","৳ 1,000/hr"],
          ].map(([k, v]) => (
            <div key={String(k)} className="flex justify-between">
              <span className="text-muted-foreground">{k}</span>
              <span className={typeof v === "string" && v.startsWith("৳") ? "font-semibold text-amber-600 dark:text-amber-400" : "font-medium"}>{v}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Slot rules */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Slot rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {RULES.map((rule) => (
              <li key={rule} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                {rule}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardContent className="pt-4 space-y-2">
          <Button className="w-full justify-start" variant="default" size="sm" asChild>
            <Link href="#generate"><Zap className="mr-2 h-4 w-4" /> Generate slots</Link>
          </Button>
          <Button className="w-full justify-start" variant="outline" size="sm" asChild>
            <Link href="#block"><Ban className="mr-2 h-4 w-4" /> Block slot</Link>
          </Button>
          <Button className="w-full justify-start" variant="outline" size="sm">
            <Unlock className="mr-2 h-4 w-4" /> Unblock all today
          </Button>
          <Button className="w-full justify-start" variant="outline" size="sm" asChild>
            <Link href="/dashboard/bookings/calendar"><CalendarRange className="mr-2 h-4 w-4" /> View calendar</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
