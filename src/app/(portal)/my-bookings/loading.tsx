import { MyBookingsSkeleton } from "@/components/portal/loading/account-skeletons";

// The same skeleton MyBookingsView shows while the session loads, so the hand-over doesn't move.
export default function MyBookingsLoading() {
  return <MyBookingsSkeleton className="page-loading" />;
}
