import type {
  CheckoutOptions, CheckoutResult, CustomerBooking, CustomerSession, PayResult, PublicBooking,
} from "@/types/booking";

// Portal calls to turf-api through the /api/v1 proxy. Customers have no login: a booking is
// reached with the signed `token` from its confirmation link.

/** Carries turf-api's error `code`, e.g. SLOT_NOT_AVAILABLE or CANCELLATION_WINDOW_PASSED. */
export class PortalApiError extends Error {
  constructor(message: string, public code?: string, public details?: { field: string; message: string }[]) {
    super(message);
    this.name = "PortalApiError";
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, {
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

export const getCheckoutOptions = () => call<CheckoutOptions>("/checkout/options");

export const startCheckout = (body: {
  groundId: string;
  date: string;
  hour: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: "card" | "cash";
}) => call<CheckoutResult>("/checkout", { method: "POST", body: JSON.stringify(body) });

const withToken = (path: string, token: string) => `${path}?token=${encodeURIComponent(token)}`;

export const getPublicBooking = (id: string, token: string) =>
  call<PublicBooking>(withToken(`/bookings/${id}`, token));

export const cancelPublicBooking = (id: string, token: string) =>
  call<PublicBooking>(withToken(`/bookings/${id}/cancel`, token), { method: "POST" });

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

export const sendSignInCode = (phone: string) =>
  call<{ sent: true }>("/customer/auth/send-code", { method: "POST", body: JSON.stringify({ phone }) });

export const verifySignInCode = (phone: string, code: string) =>
  call<CustomerSession>("/customer/auth/verify", { method: "POST", body: JSON.stringify({ phone, code }) });

/** The signed-in customer, or null when signed out (401). */
export async function getCustomerSession(): Promise<CustomerSession | null> {
  try {
    return await call<CustomerSession>("/customer/auth/me");
  } catch (err) {
    if (err instanceof PortalApiError && err.code === "UNAUTHENTICATED") return null;
    throw err;
  }
}

/** Signs out on every device. */
export const customerSignOut = () => call<{ loggedOut: true }>("/customer/auth/logout", { method: "POST" });

/** Every booking made with the signed-in phone. Upcoming: soonest first; past: latest first. */
export const listMyBookings = (scope: "upcoming" | "past", page: number, limit = 10) =>
  call<{ data: CustomerBooking[]; total: number; page: number; limit: number }>(
    `/customer/bookings?scope=${scope}&page=${page}&limit=${limit}`,
  );

/** Turns turf-api's absolute or relative confirmation link into an in-app path. */
export function toAppPath(url: string) {
  const u = new URL(url, typeof window === "undefined" ? "http://localhost" : window.location.origin);
  return `${u.pathname}${u.search}`;
}
