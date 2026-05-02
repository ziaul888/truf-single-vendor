import {
  LayoutDashboard, MapPin, MapPinPlus, List, CalendarDays,
  CalendarCheck, CalendarRange, Users, UserCog,
  UserCheck, CreditCard, Receipt, RotateCcw, BarChart3,
  TrendingUp, FileText, Clock, Ban, SlidersHorizontal, LayoutGrid,
  Settings, Building2, CalendarCog, Wallet, Bell, ShieldCheck, Database,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SubItem { label: string; href: string; icon: LucideIcon }
export interface NavItem  { label: string; href: string; icon: LucideIcon; color: string; children?: SubItem[] }
export interface NavGroup { label: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-violet-500" },
    ],
  },
  {
    label: "Management",
    items: [
      {
        label: "Grounds", href: "/dashboard/grounds", icon: MapPin, color: "text-emerald-500",
        children: [
          { label: "All Grounds", href: "/dashboard/grounds",     icon: List       },
          { label: "Add Ground",  href: "/dashboard/grounds/new", icon: MapPinPlus },
        ],
      },
      {
        label: "Bookings", href: "/dashboard/bookings", icon: CalendarDays, color: "text-blue-500",
        children: [
          { label: "All Bookings",    href: "/dashboard/bookings",           icon: List          },
          { label: "Calendar View",   href: "/dashboard/bookings/calendar",  icon: CalendarRange },
          { label: "Confirm Booking", href: "/dashboard/bookings/confirmed", icon: CalendarCheck },
        ],
      },
      {
        label: "Slots", href: "/dashboard/slots", icon: Clock, color: "text-amber-500",
        children: [
          { label: "All Slots",     href: "/dashboard/slots",          icon: LayoutGrid        },
          { label: "Blocked Slots", href: "/dashboard/slots/blocked",  icon: Ban               },
          { label: "Settings",      href: "/dashboard/slots/settings", icon: SlidersHorizontal },
        ],
      },
      {
        label: "Customers", href: "/dashboard/customers", icon: Users, color: "text-pink-500",
        children: [
          { label: "All Customers", href: "/dashboard/customers", icon: List },
        ],
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Staff", href: "/dashboard/staff", icon: UserCog, color: "text-cyan-500",
        children: [
          { label: "All Staff",  href: "/dashboard/staff",       icon: List      },
          { label: "Roles",      href: "/dashboard/staff/roles", icon: UserCheck },
        ],
      },
      {
        label: "Payments", href: "/dashboard/payments", icon: CreditCard, color: "text-orange-500",
        children: [
          { label: "All Payments", href: "/dashboard/payments",          icon: List      },
          { label: "Invoices",     href: "/dashboard/payments/invoices", icon: Receipt   },
          { label: "Refunds",      href: "/dashboard/payments/refunds",  icon: RotateCcw },
        ],
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        label: "Reports", href: "/dashboard/reports", icon: BarChart3, color: "text-rose-500",
        children: [
          { label: "Revenue",  href: "/dashboard/reports/revenue",  icon: TrendingUp   },
          { label: "Bookings", href: "/dashboard/reports/bookings", icon: CalendarDays },
          { label: "Export",   href: "/dashboard/reports/export",   icon: FileText     },
        ],
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        label: "Settings", href: "/dashboard/settings", icon: Settings, color: "text-slate-500",
        children: [
          { label: "General",       href: "/dashboard/settings/general",       icon: Building2   },
          { label: "Booking",       href: "/dashboard/settings/booking",       icon: CalendarCog },
          { label: "Payments",      href: "/dashboard/settings/payments",      icon: Wallet      },
          { label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell        },
          { label: "Access",        href: "/dashboard/settings/access",        icon: ShieldCheck },
          { label: "System",        href: "/dashboard/settings/system",        icon: Database    },
        ],
      },
    ],
  },
];
