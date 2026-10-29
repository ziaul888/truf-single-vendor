import type { ApiResponse, TimeSlot, Paginated } from "@/types/api";
import type { ApiPublicGround } from "@/types/ground";
import { redirectToLogin } from "./redirect-to-login";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

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

  if (res.status === 401) {
    redirectToLogin();
    throw new HttpError(401, "Your session has expired. Please sign in again.");
  }

  const json = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !json.success) {
    const message = !json.success ? json.error : `Request failed (${res.status})`;
    throw new HttpError(res.status, message);
  }

  return json.data;
}

export const api = {
  grounds: {
    // turf-api v1 filters by name only; sport/format filters don't exist.
    list: (params?: { search?: string; page?: number; limit?: number }) => {
      const entries = Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== "");
      const qs = entries.length ? "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])) : "";
      return request<Paginated<ApiPublicGround>>(`/grounds${qs}`);
    },
    get: (id: string) => request<ApiPublicGround>(`/grounds/${encodeURIComponent(id)}`),
    slots: (id: string, date: string) =>
      request<TimeSlot[]>(`/grounds/${id}/slots?date=${date}`),
  },
};

export { HttpError };
