import type { ApiResponse, Ground, TimeSlot, Booking, Paginated } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    credentials: "include",
    cache: init.cache ?? "no-store",
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.success) {
    const message = !json.success ? json.error : `Request failed (${res.status})`;
    throw new HttpError(res.status, message);
  }

  return json.data;
}

export const api = {
  grounds: {
    list: (params?: { sport?: string; format?: string }) => {
      const qs = params ? "?" + new URLSearchParams(params as Record<string, string>) : "";
      return request<Ground[]>(`/grounds${qs}`);
    },
    get: (id: string) => request<Ground>(`/grounds/${id}`),
    slots: (id: string, date: string) =>
      request<TimeSlot[]>(`/grounds/${id}/slots?date=${date}`),
  },
  bookings: {
    create: (input: {
      groundId: string;
      slotId: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
    }) =>
      request<{ booking: Booking; checkoutUrl: string }>(`/bookings`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    get: (id: string) => request<Booking>(`/bookings/${id}`),
    listMine: (status?: "upcoming" | "past" | "cancelled") =>
      request<Paginated<Booking>>(`/bookings/me${status ? `?status=${status}` : ""}`),
    cancel: (id: string) =>
      request<Booking>(`/bookings/${id}/cancel`, { method: "POST" }),
  },
};

export { HttpError };
