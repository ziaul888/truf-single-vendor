import {
  LayoutDashboard,
  MapPin,
  MapPinPlus,
  List,
  CalendarDays,
  CalendarPlus,
  CalendarCheck,
  CalendarRange,
  Users,
  UserCog,
  UserCheck,
  BarChart3,
  TrendingUp,
  FileText,
  Clock,
  Ban,
  SlidersHorizontal,
  LayoutGrid,
  Settings,
  Building2,
  CalendarCog,
  Wallet,
  Bell,
  ShieldCheck,
  Database,
  Globe,
  CalendarOff,
  History,
  Undo2,
  Palette,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { featureForDashboardPath, hasPlanFeature, type PlanFeature } from "@/lib/plan-features";

export interface SubItem {
  label: string;
  href: string;
  icon: LucideIcon;
  ownerOnly?: boolean;
}
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
  children?: SubItem[];
  /** Hidden for managers — the API rejects them anyway. */
  adminOnly?: boolean;
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: "Daily work",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-sidebar-primary" },
      {
        label: "Bookings",
        href: "/dashboard/bookings",
        icon: CalendarDays,
        color: "text-info",
        children: [
          { label: "All bookings", href: "/dashboard/bookings", icon: List },
          { label: "New booking", href: "/dashboard/bookings/new", icon: CalendarPlus },
          { label: "Calendar", href: "/dashboard/bookings/calendar", icon: CalendarRange },
          { label: "Confirm bookings", href: "/dashboard/bookings/confirmed", icon: CalendarCheck },
          { label: "Refund bookings", href: "/dashboard/bookings/refunds", icon: Undo2 },
        ],
      },
      {
        label: "Slots",
        href: "/dashboard/slots",
        icon: Clock,
        color: "text-warning",
        children: [
          { label: "All slots", href: "/dashboard/slots", icon: LayoutGrid },
          { label: "Blocked slots", href: "/dashboard/slots/blocked", icon: Ban },
          { label: "Closures", href: "/dashboard/slots/closures", icon: CalendarOff },
          { label: "Activity", href: "/dashboard/slots/activity", icon: History },
          { label: "Slot settings", href: "/dashboard/slots/settings", icon: SlidersHorizontal },
        ],
      },
      { label: "Customers", href: "/dashboard/customers", icon: Users, color: "text-accent" },
    ],
  },
  {
    label: "Manage venue",
    items: [
      {
        label: "Grounds",
        href: "/dashboard/grounds",
        icon: MapPin,
        color: "text-success",
        children: [
          { label: "All grounds", href: "/dashboard/grounds", icon: List },
          { label: "Add ground", href: "/dashboard/grounds/new", icon: MapPinPlus },
        ],
      },
      {
        label: "Staff",
        href: "/dashboard/staff",
        icon: UserCog,
        color: "text-chart-4",
        adminOnly: true,
        children: [
          { label: "All staff", href: "/dashboard/staff", icon: List },
          { label: "Roles", href: "/dashboard/staff/roles", icon: UserCheck },
        ],
      },
      {
        label: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
        color: "text-destructive",
        children: [
          { label: "Overview", href: "/dashboard/reports", icon: BarChart3 },
          { label: "Sales", href: "/dashboard/reports/revenue", icon: TrendingUp },
          { label: "Bookings", href: "/dashboard/reports/bookings", icon: CalendarDays },
          { label: "Export", href: "/dashboard/reports/export", icon: FileText },
        ],
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        color: "text-muted-foreground",
        children: [
          { label: "General", href: "/dashboard/settings/general", icon: Building2 },
          { label: "Appearance", href: "/dashboard/settings/appearance", icon: Palette, ownerOnly: true },
          { label: "Website", href: "/dashboard/settings/website", icon: Globe },
          { label: "Booking", href: "/dashboard/settings/booking", icon: CalendarCog },
          { label: "Payments", href: "/dashboard/settings/payments", icon: Wallet },
          { label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
          { label: "Access", href: "/dashboard/settings/access", icon: ShieldCheck },
          { label: "System", href: "/dashboard/settings/system", icon: Database },
        ],
      },
    ],
  },
];

export function navForRole(role: string | undefined, features?: readonly PlanFeature[]): NavGroup[] {
  const admin = role === "owner" || role === "admin";
  if (role === "owner" && !features) return NAV;
  const canVisit = ({ href, ownerOnly }: Pick<SubItem, "href" | "ownerOnly">) => {
    if (ownerOnly && role !== "owner") return false;
    const feature = featureForDashboardPath(href);
    return !feature || hasPlanFeature(features, feature);
  };
  return NAV.map((group) => ({
    ...group,
    items: group.items
      .filter((item) => (admin || !item.adminOnly) && canVisit(item))
      .map((item) => ({ ...item, children: item.children?.filter(canVisit) })),
  })).filter((group) => group.items.length > 0);
}
