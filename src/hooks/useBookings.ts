import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  Booking, BookingDetail, BookingPage, BookingStatus, CreateBookingInput, OfflineMethod, PaymentStatus,
} from "@/types/booking";

export type { Booking, BookingDetail };

export interface BookingFilters {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  groundId?: string;
  customerId?: string;
  /** Slot date range; send both or neither. */
  from?: string;
  to?: string;
  /** Booking number, name or phone. */
  search?: string;
  sort?: "created" | "slot";
  page?: number;
  limit?: number;
}

const BOOKINGS_KEY = ["bookings"] as const;

const cleanParams = (filters: object) =>
  Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== "" && v !== "all"));

/** Admin bookings list. `counts` ignore the status filter (stat cards). */
export function useBookings(filters: BookingFilters = {}, { enabled = true } = {}) {
  return useQuery<BookingPage>({
    queryKey: [...BOOKINGS_KEY, "list", filters],
    queryFn: async () => (await api.get("/admin/bookings", { params: cleanParams(filters) })).data.data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useBookingDetail(id: string | undefined) {
  return useQuery<BookingDetail>({
    queryKey: [...BOOKINGS_KEY, "detail", id],
    queryFn: async () => (await api.get(`/admin/bookings/${id}`)).data.data,
    enabled: !!id,
    retry: false,
  });
}

/** The next pending or confirmed bookings (dashboard home). */
export function useUpcomingBookings(limit = 5) {
  return useQuery<Booking[]>({
    queryKey: [...BOOKINGS_KEY, "upcoming", limit],
    queryFn: async () => (await api.get("/admin/bookings/upcoming", { params: { limit } })).data.data,
  });
}

/** Booking changes also move slots, calendar, customer and dashboard numbers, so refresh them all. */
function useBookingMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      for (const key of [BOOKINGS_KEY, ["slots"], ["calendar"], ["customers"], ["dashboard"]]) {
        qc.invalidateQueries({ queryKey: key });
      }
    },
  });
}

/** Staff booking: walk-in or phone. Price is the slot's price, no service fee. */
export function useCreateBooking() {
  return useBookingMutation(async (body: CreateBookingInput) =>
    (await api.post("/admin/bookings", body)).data.data as Booking);
}

/** Pending staff bookings and portal pay-at-venue bookings. Portal card bookings confirm by payment. */
export function useConfirmBooking() {
  return useBookingMutation(
    async ({ id, ...body }: { id: string; markPaid?: boolean; method?: OfflineMethod; notifyCustomer?: boolean }) =>
      (await api.post(`/admin/bookings/${id}/confirm`, body)).data.data as Booking,
  );
}

/** Cancel, or "Decline" a pending booking. Card payments are refunded through Stripe; cash is marked refunded. */
export function useCancelBooking() {
  return useBookingMutation(
    async ({ id, ...body }: { id: string; refund: boolean; reason?: string; notifyCustomer?: boolean }) =>
      (await api.post(`/admin/bookings/${id}/cancel`, body)).data.data as Booking,
  );
}

/** Records cash or a bank transfer against a booking (collecting a due amount). */
export function useRecordPayment() {
  return useBookingMutation(
    async ({ id, ...body }: { id: string; amount: number; method: OfflineMethod; note?: string }) =>
      (await api.post(`/admin/bookings/${id}/payments`, body)).data.data as Booking,
  );
}

/** Notes and due date; `null` clears a field. */
export function useUpdateBooking() {
  return useBookingMutation(
    async ({ id, ...body }: { id: string; notes?: string | null; dueDate?: string | null; dueNote?: string | null }) =>
      (await api.patch(`/admin/bookings/${id}`, body)).data.data as Booking,
  );
}

/** `sent: false` when email isn't configured on the server. */
export function useResendConfirmation() {
  return useBookingMutation(async (id: string) =>
    (await api.post(`/admin/bookings/${id}/resend-confirmation`)).data.data as { sent: boolean });
}
