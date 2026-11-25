const PAGE_TITLES: Record<string, string> = {
  "/bookings": "Bookings",
  "/bookings/calendar": "Calendar",
  "/bookings/confirmed": "Confirm bookings",
  "/bookings/new": "New booking",
  "/bookings/refunds": "Refund bookings",
  "/customers": "Customers",
  "/grounds": "Grounds",
  "/grounds/new": "Add ground",
  "/profile": "Profile",
  "/reports": "Reports",
  "/reports/bookings": "Bookings report",
  "/reports/export": "Export data",
  "/reports/revenue": "Sales report",
  "/settings": "Settings",
  "/settings/access": "Access",
  "/settings/appearance": "Appearance",
  "/settings/booking": "Booking settings",
  "/settings/general": "General settings",
  "/settings/notifications": "Notifications",
  "/settings/payments": "Payments",
  "/settings/system": "System",
  "/settings/website": "Website settings",
  "/slots": "Slots",
  "/slots/activity": "Slot activity",
  "/slots/blocked": "Blocked slots",
  "/slots/closures": "Venue closures",
  "/slots/settings": "Slot settings",
  "/staff": "Staff",
  "/staff/roles": "Roles",
};

const DETAIL_TITLES: Record<string, string> = {
  bookings: "Booking details",
  customers: "Customer details",
  grounds: "Ground details",
};

export function sectionTitle(pathname: string): string {
  const route = pathname.replace(/^\/(?:admin|dashboard)(?=\/|$)/, "");
  if (PAGE_TITLES[route]) return PAGE_TITLES[route];

  const [, section, item, action] = route.split("/");
  if (section === "grounds" && item && action === "edit") return "Edit ground";
  if (item && DETAIL_TITLES[section]) return DETAIL_TITLES[section];
  return PAGE_TITLES[`/${section}`] ?? "Dashboard";
}
