import { NAV } from "@/components/sidebar-nav-data";

const pages = new Map([
  ["/dashboard/profile", "My profile"],
  ["/dashboard/slots", "Slot management"],
  ["/dashboard/slots/activity", "Slot activity"],
  ["/dashboard/slots/closures", "Venue closures"],
  ["/dashboard/bookings/calendar", "Booking calendar"],
  ["/dashboard/reports/bookings", "Booking report"],
  ["/dashboard/reports/revenue", "Sales report"],
  ["/dashboard/reports/export", "Export data"],
]);

export function dashboardTitle(pathname: string) {
  const path = pathname.replace(/^\/admin(?=\/|$)/, "/dashboard").replace(/\/$/, "");
  const page = pages.get(path);
  if (page) return page;

  for (const { items } of NAV) {
    for (const item of items) {
      if (path === item.href) return item.label;
      const child = item.children?.find(({ href }) => path === href);
      if (child) return item.label === "Settings" ? `${child.label} settings` : child.label;
    }
  }

  if (path.startsWith("/dashboard/bookings/")) return "Booking details";
  if (path.startsWith("/dashboard/customers/")) return "Customer details";
  if (path.startsWith("/dashboard/grounds/")) return path.endsWith("/edit") ? "Edit ground" : "Ground details";
  return "Dashboard";
}
