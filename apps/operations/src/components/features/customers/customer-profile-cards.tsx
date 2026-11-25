"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Phone, Mail, Calendar, MapPin, Edit, Trash2, PlusCircle, DollarSign } from "lucide-react";
import type { CustomerDetail } from "@/types/booking";
import { avatarBg, initials, formatSince, formatDate, formatTaka, TAG_CLS, TAG_LABEL } from "./customer-display";

const DELETE_CLS = "text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5";

export function CustomerProfileHeader({
  customer: c, canDelete, onEdit, onDelete,
}: {
  customer: CustomerDetail;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <header className="flex min-w-0 flex-col gap-3 md:flex-row md:flex-wrap md:items-start md:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-md sm:size-16 sm:text-xl" style={{ backgroundColor: avatarBg(c.name) }}>
              {initials(c.name)}
            </div>
            <div className="min-w-0 space-y-1 [overflow-wrap:anywhere]">
              <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{c.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", TAG_CLS[c.tag])}>{TAG_LABEL[c.tag]}</span>
                {c.dueAmount > 0 && (
                  <span className="rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-0.5 text-xs font-semibold border border-red-200 dark:border-red-800">
                    Due {formatTaka(c.dueAmount)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{c.phone} · Customer since {formatSince(c.createdAt)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
            <Button size="sm" className="col-span-2" asChild>
              <Link href={`/dashboard/bookings/new?customer=${c.id}`}><PlusCircle /> New booking</Link>
            </Button>
            <Button variant="outline" size="sm" className={cn(!canDelete && "col-span-2")} onClick={onEdit}><Edit /> Edit profile</Button>
            {canDelete && (
              <Button variant="outline" size="sm" className={DELETE_CLS} onClick={onDelete}>
                <Trash2 /> Delete
              </Button>
            )}
          </div>
        </header>
      </CardContent>
    </Card>
  );
}

export function CustomerStatCards({ customer: c }: { customer: CustomerDetail }) {
  const cards = [
    { label: "Total bookings",   value: c.bookings,                                   color: "text-foreground" },
    { label: "Total spent",      value: c.totalSpent > 0 ? formatTaka(c.totalSpent) : "৳ 0", color: "text-blue-600 dark:text-blue-400" },
    { label: "Due amount",       value: formatTaka(c.dueAmount),                      color: c.dueAmount > 0 ? "text-amber-500" : "text-muted-foreground" },
    { label: "Last booking",     value: formatDate(c.lastBooking),                    color: "text-foreground" },
    { label: "Favourite ground", value: c.favoriteGround?.name ?? "—",                color: "text-green-600 dark:text-green-400" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map(({ label, value, color }) => (
        <Card key={label}><CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className={cn("text-lg font-bold leading-tight", color)}>{value}</p>
        </CardContent></Card>
      ))}
    </div>
  );
}

export function CustomerContactCard({ customer: c }: { customer: CustomerDetail }) {
  const fav = c.favoriteGround;
  const rows = [
    { icon: Phone,    label: "Phone",            value: c.phone },
    { icon: Mail,     label: "Email",            value: c.email ?? "No email" },
    { icon: Calendar, label: "Customer since",   value: formatDate(c.createdAt) },
    { icon: MapPin,   label: "Favourite ground", value: fav ? `${fav.name} (${fav.bookings} bookings)` : "—" },
  ];
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Contact information</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0"><p className="text-[11px] text-muted-foreground">{label}</p><p className="text-sm font-medium truncate">{value}</p></div>
            </div>
          ))}
        </div>
        {c.adminNote && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-3">
            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 mb-1">Admin note</p>
            <p className="text-sm text-amber-800 dark:text-amber-300 whitespace-pre-line">{c.adminNote}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function CustomerQuickActions({
  customer: c, canDelete, onEdit, onDelete, onCollect,
}: {
  customer: CustomerDetail;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCollect: (() => void) | null;
}) {
  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base">Quick actions</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Button className="w-full justify-start" variant="outline" size="sm" asChild>
          <Link href={`/dashboard/bookings/new?customer=${c.id}`}><PlusCircle className="mr-2 h-4 w-4 text-blue-500" /> New booking</Link>
        </Button>
        {onCollect && (
          <Button className="w-full justify-start" variant="outline" size="sm" onClick={onCollect}>
            <DollarSign className="mr-2 h-4 w-4 text-amber-500" />Collect due payment
          </Button>
        )}
        <Button className="w-full justify-start" variant="outline" size="sm" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4 text-green-500" /> Edit profile
        </Button>
        {canDelete && (
          <Button className={cn("w-full justify-start", DELETE_CLS)} variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete customer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
