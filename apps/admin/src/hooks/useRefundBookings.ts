import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDashboardApi } from "./useDashboardApi";
import type { PaymentMethod } from "@/types/booking";
import type { RefundBookingPage, RefundStatus } from "@/types/refund-booking";

interface RefundBookingFilters {
  status: RefundStatus;
  search?: string;
  groundId?: string;
  method?: PaymentMethod;
  page: number;
  limit: number;
}

/** Shares booking invalidation so recording a refund refreshes this list. */
export function useRefundBookings(filters: RefundBookingFilters) {
  const { client, scope } = useDashboardApi();
  return useQuery<RefundBookingPage>({
    queryKey: [...scope, "bookings", "refunds", filters],
    queryFn: async () => (await client.get("/admin/bookings/refunds", { params: filters })).data.data,
    placeholderData: keepPreviousData,
  });
}
