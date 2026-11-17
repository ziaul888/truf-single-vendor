import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { platformApi } from "@/lib/platform-api";
import type { ApiSuccess, Paginated } from "@/types/api";
import type {
  PlatformPlan,
  PlatformSubscription,
  PlatformInvoice,
  TenantBilling,
  PlatformActivity,
  BillingFilters,
} from "@/types/platform-billing";
function useBillingQuery<T>(userId: string | undefined, path: string, params?: BillingFilters) {
  return useQuery({
    queryKey: ["platform", userId, "billing", path, params],
    enabled: !!userId,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: async ({ signal }) =>
      (await platformApi.get<ApiSuccess<T>>(path, { signal, params })).data.data,
  });
}
export const usePlatformPlans = (
  userId?: string,
  filters: BillingFilters = { page: 1, limit: 100 }
) => useBillingQuery<Paginated<PlatformPlan>>(userId, "/plans", filters);
export const usePlatformSubscriptions = (userId: string | undefined, filters: BillingFilters) =>
  useBillingQuery<Paginated<PlatformSubscription>>(userId, "/subscriptions", filters);
export const usePlatformInvoices = (userId: string | undefined, filters: BillingFilters) =>
  useBillingQuery<Paginated<PlatformInvoice>>(userId, "/invoices", filters);
export const usePlatformInvoice = (userId: string | undefined, id: string) =>
  useBillingQuery<PlatformInvoice>(userId, `/invoices/${encodeURIComponent(id)}`);
export const useTenantBilling = (userId: string | undefined, id: string) =>
  useBillingQuery<TenantBilling>(userId, `/tenants/${encodeURIComponent(id)}/billing`);
export const useTenantActivity = (userId: string | undefined, id: string) =>
  useBillingQuery<Paginated<PlatformActivity>>(
    userId,
    `/tenants/${encodeURIComponent(id)}/activity`,
    { page: 1, limit: 6 }
  );
/** Preserve the request ID for an unchanged retry after a network failure. */
export function usePlatformCommand<TInput extends object, TOutput>(
  userId: string | undefined,
  path: string
) {
  const client = useQueryClient(),
    attempt = useRef<{ payload: string; id: string } | null>(null);
  return useMutation({
    mutationFn: async (input: TInput) => {
      const payload = JSON.stringify({ userId, path, input });
      if (!attempt.current || attempt.current.payload !== payload)
        attempt.current = { payload, id: crypto.randomUUID() };
      return (
        await platformApi.post<ApiSuccess<TOutput>>(path, {
          ...input,
          requestId: attempt.current.id,
        })
      ).data.data;
    },
    onSuccess: async () => {
      attempt.current = null;
      await client.invalidateQueries({ queryKey: ["platform", userId] });
    },
  });
}
