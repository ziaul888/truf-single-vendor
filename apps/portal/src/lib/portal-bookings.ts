import type {
  CheckoutMethod, CheckoutOptions, CheckoutResult, CustomerBooking, CustomerSession, PayResult, PublicBooking, WalletMethod,
} from "@/types/booking";
import { checkoutSlotRequest } from "@/lib/booking-requests";
import { turfPortalApiPrefix } from "@/lib/turf-portal-path";

// Portal calls to turf-api through the /api/v1 proxy. Customers have no login: a booking is
// reached with the signed `token` from its confirmation link.

/** Carries turf-api's error `code`, e.g. SLOT_NOT_AVAILABLE or CANCELLATION_WINDOW_PASSED. */
export class PortalApiError extends Error {
  constructor(message: string, public code?: string, public details?: { field: string; message: string }[]) {
    super(message);
    this.name = "PortalApiError";
  }
}

async function call<T>(path: string, init?: RequestInit, slug?: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/v1${turfPortalApiPrefix(slug)}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      cache: "no-store",
    });
  } catch {
    throw new PortalApiError("Cannot reach the server. Please try again.");
  }
  const json = await res.json().catch(() => null);
  if (!json?.success) throw new PortalApiError(json?.error ?? "Something went wrong. Please try again.", json?.code, json?.details);
  return json.data as T;
}

export const getCheckoutOptions = (slug?: string) => call<CheckoutOptions>("/checkout/options", undefined, slug);

export const startCheckout = (body: {
  groundId: string;
  date: string;
  /** 1 to 4 slots on this ground and date, by start time (0 or 30 minutes: 90-minute slots start on the half hour). */
  slots: { startHour: number; startMinute?: number }[];
  customerName: string;
  /** "" for none: only when signed in (a guest gets 400 EMAIL_REQUIRED). */
  customerEmail: string;
  customerPhone: string;
  paymentMethod: CheckoutMethod;
  /** bKash / Nagad, or cash with booking money: the TrxID and the number the money was sent from. */
  reference?: string;
  payerNumber?: string;
  /** Cash with booking money only: the wallet the booking money was sent through. Never sent for other methods. */
  depositMethod?: WalletMethod;
}, slug?: string) => {
  const { slots, ...details } = body;
  return call<CheckoutResult>("/checkout", {
    method: "POST", body: JSON.stringify({ ...details, ...checkoutSlotRequest(slots) }),
  }, slug);
};

const withToken = (path: string, token: string) => `${path}?token=${encodeURIComponent(token)}`;

export const getPublicBooking = (id: string, token: string, slug?: string) =>
  call<PublicBooking>(withToken(`/bookings/${id}`, token), undefined, slug);

export const cancelPublicBooking = (id: string, token: string, slug?: string) =>
  call<PublicBooking>(withToken(`/bookings/${id}/cancel`, token), { method: "POST" }, slug);

/** While a bKash / Nagad payment is being verified: ask the venue to cancel. 409 CANCEL_ALREADY_REQUESTED. */
export const requestCancellation = (id: string, token: string, slug?: string) =>
  call<PublicBooking>(withToken(`/bookings/${id}/cancel-request`, token), { method: "POST" }, slug);

/**
 * "Pay now": a Stripe checkout for whatever is due (unpaid staff booking, pay-at-venue, the rest
 * after an advance). An unfinished card checkout gets its open Stripe page back. 409 NOTHING_DUE.
 */
export const payBooking = (id: string, token: string) =>
  call<PayResult>(withToken(`/bookings/${id}/pay`, token), { method: "POST" });

// Stripe returns customers to the same confirmation page, so before leaving we note how much
// was paid; the page then polls only after a real return from Stripe (not for every unpaid booking).
const RETURN_KEY = (id: string) => `turf:paying:${id}`;

/** Call right before redirecting to Stripe. */
export function markLeavingForPayment(bookingId: string, paidBefore: number) {
  try { sessionStorage.setItem(RETURN_KEY(bookingId), String(paidBefore)); } catch { /* storage unavailable: no polling */ }
}

/** The amount paid before the customer left for Stripe, or null if they didn't just come back. */
export function paidBeforeLeaving(bookingId: string): number | null {
  try {
    const v = sessionStorage.getItem(RETURN_KEY(bookingId));
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
}

export function clearPaymentReturn(bookingId: string) {
  try { sessionStorage.removeItem(RETURN_KEY(bookingId)); } catch { /* nothing to clear */ }
}

// ── Customer sign-in: phone + SMS code. Optional; guests and signed links keep working. ──

export const sendSignInCode = (phone: string, slug?: string) =>
  call<{ sent: true }>("/customer/auth/send-code", { method: "POST", body: JSON.stringify({ phone }) }, slug);

export const verifySignInCode = (phone: string, code: string, slug?: string) =>
  call<CustomerSession>("/customer/auth/verify", { method: "POST", body: JSON.stringify({ phone, code }) }, slug);

export const verifyPhoneLink = (phone: string, code: string, slug?: string) =>
  call<CustomerSession>("/customer/auth/verify", {
    method: "POST", body: JSON.stringify({ phone, code, linkPhone: true }),
  }, slug);

type CustomerEmailCodePurpose = "sign-in" | "link";
const emailAuthPath = (purpose: CustomerEmailCodePurpose) =>
  purpose === "link" ? "/customer/auth/email/link" : "/customer/auth/email";

export const sendEmailCode = (purpose: CustomerEmailCodePurpose, email: string, slug?: string) =>
  call<{ sent: true }>(`${emailAuthPath(purpose)}/send-code`, {
    method: "POST", body: JSON.stringify({ email }),
  }, slug);

export const verifyEmailCode = (purpose: CustomerEmailCodePurpose, email: string, code: string, slug?: string) =>
  call<CustomerSession>(`${emailAuthPath(purpose)}/verify`, {
    method: "POST", body: JSON.stringify({ email, code }),
  }, slug);

/** Creates the customer record for a new number, or updates name and email ("" keeps the stored email). */
export const saveCustomerProfile = (profile: { name: string; email: string }, slug?: string) =>
  call<CustomerSession>("/customer/auth/profile", { method: "POST", body: JSON.stringify(profile) }, slug);

/** The signed-in customer, or null when signed out (401). */
export async function getCustomerSession(slug?: string): Promise<CustomerSession | null> {
  try {
    return await call<CustomerSession>("/customer/auth/me", undefined, slug);
  } catch (err) {
    if (err instanceof PortalApiError && err.code === "UNAUTHENTICATED") return null;
    throw err;
  }
}

/** Signs out on every device. */
export const customerSignOut = (slug?: string) =>
  call<{ loggedOut: true }>("/customer/auth/logout", { method: "POST" }, slug);

/** Every booking made with the signed-in phone. Upcoming: soonest first; past: latest first. */
export const listMyBookings = (scope: "upcoming" | "past", page: number, limit = 10, slug?: string) =>
  call<{ data: CustomerBooking[]; total: number; page: number; limit: number }>(
    `/customer/bookings?scope=${scope}&page=${page}&limit=${limit}`,
    undefined,
    slug,
  );

/** Turns turf-api's absolute or relative confirmation link into an in-app path. */
export function toAppPath(url: string) {
  const u = new URL(url, typeof window === "undefined" ? "http://localhost" : window.location.origin);
  return `${u.pathname}${u.search}`;
}
