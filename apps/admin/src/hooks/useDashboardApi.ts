import { useDashboardAudience } from "@/components/dashboard-audience";
import api from "@/lib/api";
import { ownerApi } from "@/lib/owner-api";

export function useDashboardApi() {
  const tenant = useDashboardAudience() === "owner";
  return { client: tenant ? ownerApi : api, scope: tenant ? (["owner"] as const) : ([] as const) };
}
