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

export const OWNER_APPLICATION_STATUSES = ["pending", "activated", "rejected"] as const;
export type OwnerApplicationStatus = (typeof OWNER_APPLICATION_STATUSES)[number];
export interface OwnerApplication {
  id: string;
  turfName: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  timezone: string;
  currency: string;
  billingInterval: "monthly" | "yearly" | null;
  payment: {
    method: "bkash" | "nagad" | "bank_transfer";
    reference: string;
    date: string;
  } | null;
  plan: {
    id: string;
    versionId: string;
    version: number;
    code: string;
    name: string;
    description: string | null;
    interval: "monthly" | "yearly";
    currency: string;
    monthlyAmount: number;
    yearlyAmount: number;
    selectedAmount: number;
  } | null;
  status: OwnerApplicationStatus;
  reviewedAt: string | null;
  tenantId: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface OwnerApplicationFilters {
  page: number;
  limit: number;
  status?: OwnerApplicationStatus;
}
export type OwnerApplicationPage = Paginated<OwnerApplication>;
