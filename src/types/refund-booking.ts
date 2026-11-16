import type { Booking, PaymentMethod } from "./booking";

export const REFUND_STATUSES = ["all", "due", "recorded"] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

export interface RefundBooking extends Booking {
  refundSummary: {
    amount: number;
    dueAmount: number;
    methods: PaymentMethod[];
    status: Exclude<RefundStatus, "all">;
    refundedAt: string | null;
  };
}

export interface RefundBookingPage {
  data: RefundBooking[];
  total: number;
  page: number;
  limit: number;
}
