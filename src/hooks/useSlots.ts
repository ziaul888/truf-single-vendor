import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Slot, SlotStatus, SlotDuration } from "@/app/api/slots/route";

export type { Slot, SlotStatus, SlotDuration };

export interface SlotStats {
  total: number;
  available: number;
  booked: number;
  blocked: number;
  partial: number;
}

export interface SlotFilters {
  groundId?: string;
  date?: string;
  status?: string;
  duration?: string;
  page?: number;
}

export function useSlots(filters: SlotFilters = {}) {
  const params = new URLSearchParams();
  if (filters.groundId) params.set("groundId", filters.groundId);
  if (filters.date)     params.set("date",     filters.date);
  if (filters.status)   params.set("status",   filters.status);
  if (filters.duration) params.set("duration", filters.duration);
  if (filters.page)     params.set("page",     String(filters.page));

  return useQuery<{ slots: Slot[]; total: number; page: number; stats: SlotStats }>({
    queryKey: ["slots", filters],
    queryFn: async () => {
      const res  = await fetch(`/api/slots?${params}`);
      const json = await res.json();
      return json.data;
    },
  });
}

export function useToggleSlotStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, blockReason }: { id: string; status: "blocked" | "available"; blockReason?: string }) => {
      const res  = await fetch(`/api/slots/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, blockReason }) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed");
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["slots"] }),
  });
}

export function useGenerateSlots() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res  = await fetch("/api/slots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "generate", ...payload }) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed");
      return json.data as { generated: number; skipped: number };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["slots"] }),
  });
}

export function useBlockSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res  = await fetch("/api/slots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "block", ...payload }) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed");
      return json.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["slots"] }),
  });
}
