import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import api from "@/lib/api";
import { ownerApi } from "@/lib/owner-api";
import type { ApiSuccess } from "@/types/api";
import type { OwnerUser } from "@/types/owner";

export type DashboardAudience = "staff" | "owner";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager";
}

/** The signed-in dashboard user. Owner and legacy staff sessions share the same admin UI. */
export function useMe(audience: "owner"): UseQueryResult<OwnerUser>;
export function useMe(audience?: "staff"): UseQueryResult<AdminUser>;
export function useMe(audience: DashboardAudience): UseQueryResult<AdminUser | OwnerUser>;
export function useMe(audience: DashboardAudience = "staff") {
  return useQuery<AdminUser | OwnerUser>({
    queryKey: audience === "owner" ? ["owner", "me"] : ["auth", "me"],
    queryFn: async ({ signal }) => {
      if (audience === "owner") {
        return (await ownerApi.get<ApiSuccess<OwnerUser>>("/auth/me", { signal })).data.data;
      }
      return (await api.get("/admin/auth/me", { signal })).data.data as AdminUser;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
