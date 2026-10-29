import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { fromMinorUnits, hourToTime } from "@/lib/ground-format";
import type { ApiGround, GroundWriteInput } from "@/types/ground";
import type { SlotSync } from "@/types/slot";

/**
 * A dashboard ground: turf-api's fields plus display helpers.
 * Today's bookings per ground come from GET /admin/dashboard/stats (bookingsTodayByGround).
 */
export interface Ground extends ApiGround {
  /** hourlyPrice in whole currency units, for display (the off-peak price when peakPrice is set). */
  pricePerHour: number;
  /** peakPrice in whole currency units, or null when there's no peak pricing. */
  peakPricePerHour: number | null;
  /** "06:00" */
  openingTime: string;
  /** "23:00" */
  closingTime: string;
}

export function toGround(g: ApiGround): Ground {
  return {
    ...g,
    pricePerHour: fromMinorUnits(g.hourlyPrice),
    peakPricePerHour: g.peakPrice === null ? null : fromMinorUnits(g.peakPrice),
    openingTime: hourToTime(g.openingHour),
    closingTime: hourToTime(g.closingHour),
  };
}

const GROUNDS_KEY = ["grounds"] as const;

// A venue has a handful of grounds, so the dashboard loads them in one page (API max 100)
// and keeps its existing client-side search and filters.
export function useGrounds() {
  return useQuery<Ground[]>({
    queryKey: [...GROUNDS_KEY, "list"],
    queryFn: async () => {
      const { data } = await api.get("/admin/grounds", { params: { limit: 100 } });
      return (data.data.data as ApiGround[]).map(toGround);
    },
  });
}

export function useGround(id: string | undefined) {
  return useQuery<Ground>({
    queryKey: [...GROUNDS_KEY, id],
    queryFn: async () => toGround((await api.get(`/admin/grounds/${id}`)).data.data),
    enabled: !!id,
    retry: false,
  });
}

function useGroundMutation<TVars, TResult extends Ground>(fn: (vars: TVars) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GROUNDS_KEY }),
  });
}

export function useCreateGround() {
  return useGroundMutation(async (body: GroundWriteInput) => toGround((await api.post("/admin/grounds", body)).data.data));
}

/** `slotSync` is present when the change replaced future free slots (hours, length, prices, days, active). */
export function useUpdateGround() {
  return useGroundMutation(
    async ({ id, changes }: { id: string; changes: Partial<GroundWriteInput> }) => {
      const data = (await api.patch(`/admin/grounds/${id}`, changes)).data.data as ApiGround & { slotSync?: SlotSync };
      return { ...toGround(data), slotSync: data.slotSync };
    },
  );
}

/** "20 slots regenerated; 2 booked or blocked slots kept as they were." */
export function slotSyncMessage({ generated, kept }: SlotSync) {
  const regenerated = `${generated} slot${generated === 1 ? "" : "s"} regenerated`;
  return kept ? `${regenerated}; ${kept} booked or blocked slot${kept === 1 ? "" : "s"} kept as they were.` : `${regenerated}.`;
}

/** Deactivating hides a ground from the portal; there is no delete in v1. */
export function useToggleGroundStatus() {
  return useGroundMutation(
    async ({ id, isActive }: { id: string; isActive: boolean }) =>
      toGround((await api.patch(`/admin/grounds/${id}`, { isActive })).data.data),
  );
}
