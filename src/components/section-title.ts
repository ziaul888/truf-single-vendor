/** First matching prefix wins, so more specific paths come first. */
const SECTIONS: { prefix: string; title: string }[] = [
  { prefix: "/dashboard/bookings/new", title: "New booking" },
  { prefix: "/dashboard/bookings", title: "Bookings" },
  { prefix: "/dashboard/slots", title: "Slots" },
  { prefix: "/dashboard/customers", title: "Customers" },
  { prefix: "/dashboard/grounds", title: "Grounds" },
  { prefix: "/dashboard/reports", title: "Reports" },
  { prefix: "/dashboard/settings", title: "Settings" },
  { prefix: "/dashboard/staff", title: "Staff" },
  { prefix: "/dashboard/profile", title: "Profile" },
];

/** Title for the admin section the pathname belongs to, shown in the phone header. */
export function sectionTitle(pathname: string): string {
  const match = SECTIONS.find((s) => pathname === s.prefix || pathname.startsWith(`${s.prefix}/`));
  return match?.title ?? "Dashboard";
}
