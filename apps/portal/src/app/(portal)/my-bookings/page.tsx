import type { Metadata } from "next";
import { MyBookingsView } from "@/components/portal/account/my-bookings-view";

export const metadata: Metadata = { title: "My bookings" };

export default function MyBookingsPage() {
  return <MyBookingsView />;
}
