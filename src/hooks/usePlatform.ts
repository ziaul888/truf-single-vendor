import { useQuery } from "@tanstack/react-query";
import { platformApi } from "@/lib/platform-api";
import type { ApiSuccess } from "@/types/api";
import type {
  PlatformUser,
  PlatformOverview,
  PlatformTenant,
  PlatformTenantFilters,
  PlatformTenantPage,
} from "@/types/platform";

export function usePlatformMe() {
  return useQuery({
    queryKey: ["platform", "me"],
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: async ({ signal }) =>
      (await platformApi.get<ApiSuccess<PlatformUser>>("/auth/me", { signal })).data.data,
  });
}
export function usePlatformOverview(userId?: string) {
  return useQuery({
    queryKey: ["platform", userId, "overview"],
    enabled: !!userId,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: async ({ signal }) =>
      (await platformApi.get<ApiSuccess<PlatformOverview>>("/overview", { signal })).data.data,
  });
}
export function usePlatformTenants(userId: string | undefined, filters: PlatformTenantFilters) {
  return useQuery({
    queryKey: ["platform", userId, "tenants", filters],
    enabled: !!userId,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: async ({ signal }) =>
      (
        await platformApi.get<ApiSuccess<PlatformTenantPage>>("/tenants", {
          signal,
          params: filters,
        })
      ).data.data,
  });
}
export function usePlatformTenant(userId: string | undefined, id: string) {
  return useQuery({
    queryKey: ["platform", userId, "tenant", id],
    enabled: !!userId,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: async ({ signal }) =>
      (
        await platformApi.get<ApiSuccess<PlatformTenant>>(`/tenants/${encodeURIComponent(id)}`, {
          signal,
        })
      ).data.data,
  });
}
