import { useQuery } from "@tanstack/react-query";
import { ownerApi } from "@/lib/owner-api";
import { platformApi } from "@/lib/platform-api";
import type { ApiSuccess } from "@/types/api";
import type { OwnerUser, OwnerBilling, OwnerAccessState } from "@/types/owner";
export const useOwnerMe = () =>
  useQuery({
    queryKey: ["owner", "me"],
    retry: false,
    staleTime: 0,
    queryFn: async ({ signal }) =>
      (await ownerApi.get<ApiSuccess<OwnerUser>>("/auth/me", { signal })).data.data,
  });
export const useOwnerBilling = (userId?: string) =>
  useQuery({
    queryKey: ["owner", userId, "billing"],
    enabled: !!userId,
    retry: false,
    staleTime: 0,
    queryFn: async ({ signal }) =>
      (await ownerApi.get<ApiSuccess<OwnerBilling>>("/billing", { signal })).data.data,
  });
export const usePlatformOwnerAccess = (userId: string | undefined, tenantId: string) =>
  useQuery({
    queryKey: ["platform", userId, "owner-access", tenantId],
    enabled: !!userId,
    retry: false,
    staleTime: 0,
    queryFn: async ({ signal }) =>
      (
        await platformApi.get<ApiSuccess<OwnerAccessState>>(
          `/tenants/${encodeURIComponent(tenantId)}/owner-access`,
          { signal }
        )
      ).data.data,
  });
