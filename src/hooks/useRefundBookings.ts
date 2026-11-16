import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
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
  return useQuery<RefundBookingPage>({
    queryKey: ["bookings", "refunds", filters],
    queryFn: async () => (await api.get("/admin/bookings/refunds", { params: filters })).data.data,
    placeholderData: keepPreviousData,
  });
}
