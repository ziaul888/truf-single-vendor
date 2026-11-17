import type { Paginated } from "./api";

export const PLATFORM_TENANT_STATUSES = ["draft", "active", "suspended", "archived"] as const;
export type PlatformTenantStatus = (typeof PLATFORM_TENANT_STATUSES)[number];
export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  role: "platform_admin";
}
export interface PlatformTenant {
  id: string;
  name: string;
  slug: string;
  status: PlatformTenantStatus;
  timezone: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; name: string; email: string; isActive: boolean } | null;
  activeStaffCount: number;
}
export interface PlatformOverview {
  counts: Record<PlatformTenantStatus | "total", number>;
  owners: number;
  recentTenants: PlatformTenant[];
}
export interface PlatformTenantFilters {
  page: number;
  limit: number;
  search?: string;
  status?: PlatformTenantStatus;
}
export type PlatformTenantPage = Paginated<PlatformTenant>;
