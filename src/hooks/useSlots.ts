import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  BlockReason, BulkBlockInput, BulkBlockResult, BulkSlotsResult, Closure, CreateClosureInput,
  CreateClosureResult, GenerateResult, Slot, SlotCalendar, SlotEvent, SlotEventAction,
  SlotEventListItem, SlotPage, SlotSettings, SlotStatus,
} from "@/types/slot";

export type { Slot, SlotStatus };

export interface SlotFilters {
  groundId?: string;
  /** One day, or use from + to. */
  date?: string;
  from?: string;
  to?: string;
  status?: SlotStatus;
  reason?: BlockReason;
  page?: number;
  limit?: number;
}

const SLOTS_KEY = ["slots"] as const;

/** Drops empty values so turf-api only sees real filters. */
function cleanParams(filters: object) {
  return Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== "" && v !== "all"));
}

export function useSlots(filters: SlotFilters, { enabled = true } = {}) {
  return useQuery<SlotPage>({
    queryKey: [...SLOTS_KEY, "list", filters],
    queryFn: async () => (await api.get("/admin/slots", { params: cleanParams(filters) })).data.data,
    placeholderData: keepPreviousData,
    enabled,
  });
}

function useSlotMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      // Blocking a booked slot cancels its booking, so booking and dashboard numbers move too.
      for (const key of [SLOTS_KEY, ["calendar"], ["bookings"], ["dashboard"]]) qc.invalidateQueries({ queryKey: key });
    },
  });
}

/**
 * Blocks one slot. A booked slot needs `cancelBooking: true`, which cancels the booking with a full
 * refund first (`cancelledBooking` is then true). Held slots can't be blocked (409 SLOT_NOT_AVAILABLE).
 */
export function useBlockSlot() {
  return useSlotMutation(
    async ({ id, reason, note, cancelBooking }: { id: string; reason: BlockReason; note?: string; cancelBooking?: boolean }) =>
      (await api.post(`/admin/slots/${id}/block`, { reason, note, cancelBooking })).data.data as { slot: Slot; cancelledBooking: boolean },
  );
}

export function useUnblockSlot() {
  return useSlotMutation(async (id: string) => (await api.post(`/admin/slots/${id}/unblock`)).data.data as Slot);
}

/** Single slot by start hour, a full day, or a weekly repeat. */
export function useBulkBlock() {
  return useSlotMutation(async (body: BulkBlockInput) =>
    (await api.post("/admin/slots/block", body)).data.data as BulkBlockResult);
}

/** Unblocks every blocked slot on a date (optionally one ground). */
export function useUnblockDay() {
  return useSlotMutation(async (body: { groundId?: string; date: string }) =>
    (await api.post("/admin/slots/unblock", body)).data.data as { unblocked: number });
}

export function useGenerateSlots() {
  return useSlotMutation(async (body: { groundId: string; fromDate: string; toDate: string }) =>
    (await api.post("/admin/slots/generate", body)).data.data as GenerateResult);
}

/** The generate form's preview: what would be created, without saving anything. */
export function useGeneratePreview(body: { groundId: string; fromDate: string; toDate: string }, enabled: boolean) {
  return useQuery<GenerateResult>({
    queryKey: [...SLOTS_KEY, "generate-preview", body],
    queryFn: async () => (await api.post("/admin/slots/generate", { ...body, dryRun: true })).data.data,
    enabled,
    retry: false,
    placeholderData: keepPreviousData,
  });
}

export function useSlotCalendar(params: { from: string; to: string; groundId?: string }) {
  return useQuery<SlotCalendar>({
    queryKey: ["calendar", params],
    queryFn: async () => (await api.get("/admin/slots/calendar", { params: cleanParams(params) })).data.data,
    placeholderData: keepPreviousData,
  });
}

const SETTINGS_KEY = ["settings", "slots"] as const;

export function useSlotSettings() {
  return useQuery<SlotSettings>({
    queryKey: SETTINGS_KEY,
    queryFn: async () => (await api.get("/admin/settings/slots")).data.data,
  });
}

export function useUpdateSlotSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<Omit<SlotSettings, "updatedAt" | "updatedBy">>) =>
      (await api.put("/admin/settings/slots", body)).data.data as SlotSettings,
    onSuccess: (data) => {
      qc.setQueryData(SETTINGS_KEY, data);
      // portalCashEnabled also shows on the Payments page's status.
      qc.invalidateQueries({ queryKey: ["settings", "payments-status"] });
    },
  });
}

/** Blocks or unblocks the ticked slots in one request. Failed ids don't undo the others. */
export function useBulkSlotAction() {
  return useSlotMutation(
    async (body: { ids: string[]; action: "block" | "unblock"; reason?: BlockReason; note?: string }) =>
      (await api.post("/admin/slots/bulk", body)).data.data as BulkSlotsResult,
  );
}

/** One slot's audit trail, newest first. */
export function useSlotHistory(slotId: string | undefined) {
  return useQuery<SlotEvent[]>({
    queryKey: [...SLOTS_KEY, "history", slotId],
    queryFn: async () => (await api.get(`/admin/slots/${slotId}/history`)).data.data,
    enabled: !!slotId,
  });
}

export interface SlotEventFilters {
  groundId?: string;
  /** Send both or neither. */
  from?: string;
  to?: string;
  action?: SlotEventAction;
  userId?: string;
  page?: number;
  limit?: number;
}

/** The venue-wide block / unblock / closure log. */
export function useSlotEvents(filters: SlotEventFilters) {
  return useQuery<{ data: SlotEventListItem[]; total: number; page: number; limit: number }>({
    queryKey: [...SLOTS_KEY, "events", filters],
    queryFn: async () => (await api.get("/admin/slot-events", { params: cleanParams(filters) })).data.data,
    placeholderData: keepPreviousData,
  });
}

const CLOSURES_KEY = ["closures"] as const;

export function useClosures(page: number, limit = 20) {
  return useQuery<{ data: Closure[]; total: number; page: number; limit: number }>({
    queryKey: [...CLOSURES_KEY, page, limit],
    queryFn: async () => (await api.get("/admin/closures", { params: { page, limit } })).data.data,
    placeholderData: keepPreviousData,
  });
}

function useClosureMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      for (const key of [CLOSURES_KEY, SLOTS_KEY, ["calendar"]]) qc.invalidateQueries({ queryKey: key });
    },
  });
}

/** Admin only. Blocks every free slot in range now, and slots generated there later. */
export function useCreateClosure() {
  return useClosureMutation(async (body: CreateClosureInput) =>
    (await api.post("/admin/closures", body)).data.data as CreateClosureResult);
}

/** Admin only. Frees just the slots this closure blocked; the closure stays in the list as lifted. */
export function useLiftClosure() {
  return useClosureMutation(async (id: string) =>
    (await api.delete(`/admin/closures/${id}`)).data.data as { unblocked: number });
}
