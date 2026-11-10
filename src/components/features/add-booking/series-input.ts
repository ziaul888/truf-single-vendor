import { toMinorUnits } from "@/lib/ground-format";
import { addDays, venueToday } from "@/lib/slot-format";
import { SERIES_MAX_DAYS, type AddBookingFormData } from "@/schemas";
import { isWalletMethod } from "@/types/booking";
import type { CreateSeriesInput, SeriesPatternInput } from "@/types/booking-series";
import { samePhone, toApiPhone, type KnownCustomer } from "./customer-section";

/** The customer part of a staff booking: the found record's id only while the phone still matches. */
export function toCustomerInput(data: AddBookingFormData, known: KnownCustomer | null) {
  const phone = toApiPhone(data.customerPhone);
  const email = data.customerEmail.trim();
  return {
    ...(known && samePhone(known.phone, phone) ? { id: known.id } : {}),
    name: data.customerName.trim(),
    phone,
    // Blank: the API uses the customer's stored email, else none.
    ...(email ? { email } : {}),
  };
}

type PatternFields = Pick<AddBookingFormData, "groundId" | "date" | "repeatMode" | "weekdays" | "untilDate" | "startHour">;

/** The repeat pattern to preview, or null while it isn't complete (same rules as RepeatBookingSchema). */
export function toPatternInput(v: PatternFields): SeriesPatternInput | null {
  const ongoing = v.repeatMode === "ongoing";
  if (!v.groundId || !v.date || v.date < venueToday() || !v.startHour || !v.weekdays?.length) return null;
  if (!ongoing && (!v.untilDate || v.untilDate < v.date || v.untilDate > addDays(v.date, SERIES_MAX_DAYS))) return null;
  return {
    groundId: v.groundId,
    startHour: Number(v.startHour),
    weekdays: v.weekdays,
    fromDate: v.date,
    untilDate: ongoing ? null : (v.untilDate ?? null),
  };
}

/** POST /admin/booking-series body. Advance amounts go in the smallest unit. */
export function toSeriesInput(data: AddBookingFormData, known: KnownCustomer | null): CreateSeriesInput | null {
  const pattern = toPatternInput(data);
  if (!pattern) return null;
  const reference = isWalletMethod(data.paymentMethod) && data.paymentReference ? data.paymentReference : undefined;
  const payment: CreateSeriesInput["payment"] =
    data.paymentType === "none" ? { type: "none" }
    : data.paymentType === "full" ? { type: "full", method: data.paymentMethod, reference }
    : { type: "partial", method: data.paymentMethod, amount: toMinorUnits(data.advanceAmount ?? 0), reference };
  return { ...pattern, customer: toCustomerInput(data, known), payment, notes: data.notes?.trim() || undefined };
}
