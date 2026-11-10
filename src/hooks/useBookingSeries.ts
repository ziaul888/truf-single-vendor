import { keepPreviousData, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useBookingMutation } from "@/hooks/useBookings";
import type {
  BookingSeries, CreateSeriesInput, SeriesPatternInput, SeriesPaymentInput, SeriesPreview, StopSeriesInput,
} from "@/types/booking-series";

export type { BookingSeries, SeriesPreview };

/** Booking mutations refresh this key too, so a series' totals follow its bookings. */
const SERIES_KEY = ["booking-series"] as const;

/**
 * Which dates of a repeat pattern are free, and what they cost. Re-runs whenever the pattern
 * changes; `input` null (pattern not complete yet) runs nothing.
 */
export function useSeriesPreview(input: SeriesPatternInput | null) {
  return useQuery<SeriesPreview>({
    queryKey: [...SERIES_KEY, "preview", input],
    queryFn: async () => (await api.post("/admin/booking-series/preview", input)).data.data,
    enabled: input !== null,
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useBookingSeries(id: string | null | undefined) {
  return useQuery<BookingSeries>({
    queryKey: [...SERIES_KEY, "detail", id],
    queryFn: async () => (await api.get(`/admin/booking-series/${id}`)).data.data,
    enabled: !!id,
    retry: false,
  });
}

/** Books every free date of the pattern. 409 NOTHING_TO_BOOK when none was free. */
export function useCreateSeries() {
  return useBookingMutation(async (body: CreateSeriesInput) =>
    (await api.post("/admin/booking-series", body)).data.data as BookingSeries);
}

/** Cash, bank transfer, bKash or Nagad against one month's due, or all of it. 400 AMOUNT_EXCEEDS_DUE. */
export function useCollectSeriesPayment() {
  return useBookingMutation(async ({ id, ...body }: SeriesPaymentInput & { id: string }) =>
    (await api.post(`/admin/booking-series/${id}/payments`, body)).data.data as BookingSeries);
}

/** Cancels the series' bookings from a date on (optionally refunding them). 409 SERIES_STOPPED. */
export function useStopSeries() {
  return useBookingMutation(async ({ id, ...body }: StopSeriesInput & { id: string }) =>
    (await api.post(`/admin/booking-series/${id}/stop`, body)).data.data as BookingSeries);
}
