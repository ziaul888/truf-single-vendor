import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface TimelineEvent {
  event: string;
  timestamp: string;
}

export interface BookingDetail extends BookingRow {
  customerEmail: string;
  customerTotalBookings: number;
  groundType: string;
  groundCapacity: number;
  groundOpeningTime: string;
  groundClosingTime: string;
  groundIsActive: boolean;
  pricePerHour: number;
  paymentMethod: "card" | "upi" | "cash" | "bank_transfer";
  cardLast4: string | null;
  stripeTransactionId: string | null;
  timeline: TimelineEvent[];
}

export interface BookingRow {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  groundId: string;
  groundName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  amount: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid" | "refunded" | "failed" | "partial";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function useBookings() {
  return useQuery<BookingRow[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data } = await api.get("/bookings");
      return data.data;
    },
  });
}

export function useBookingDetail(id: string) {
  return useQuery<BookingDetail>({
    queryKey: ["bookings", id],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      refund,
      paymentStatus,
    }: {
      id: string;
      status: string;
      refund?: boolean;
      paymentStatus?: string;
    }) => {
      const { data } = await api.patch(`/bookings/${id}/status`, { status, refund, paymentStatus });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
