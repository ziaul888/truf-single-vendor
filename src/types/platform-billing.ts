import type { Paginated } from "./api";
export interface PlatformPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  version: number;
  currency: "bdt";
  monthlyAmount: number;
  yearlyAmount: number;
  createdAt: string;
}
export type SubscriptionStatus = "pending" | "scheduled" | "active" | "past_due" | "cancelled";
export type InvoiceStatus = "issued" | "overdue" | "paid" | "void";
export type BillingInterval = "monthly" | "yearly";
export interface PlatformSubscription {
  id: string;
  tenantId: string;
  tenant: { id: string; name: string; slug: string };
  planName: string;
  planVersionId: string;
  interval: BillingInterval;
  currency: "bdt";
  amount: number;
  startDate: string;
  paidThrough: string | null;
  status: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  cancellationRequestedAt: string | null;
  cancelReason: string | null;
  canRenew: boolean;
  openInvoiceCount: number;
  createdAt: string;
}
export interface PlatformInvoice {
  id: string;
  number: string;
  tenantId: string;
  tenant: { id: string; name: string; slug: string };
  subscriptionId: string;
  periodIndex: number;
  periodStart: string;
  periodEnd: string;
  dueOn: string;
  planName: string;
  interval: BillingInterval;
  currency: "bdt";
  amount: number;
  status: InvoiceStatus;
  createdAt: string;
  receipt: {
    id: string;
    method: "bkash" | "nagad" | "bank_transfer";
    reference: string;
    amount: number;
    currency: string;
    receivedOn: string;
    createdAt: string;
    recordedBy: { id: string; name: string };
  } | null;
}
export interface TenantBilling {
  subscription: PlatformSubscription | null;
  recentInvoices: PlatformInvoice[];
}
export interface PlatformActivity {
  id: string;
  action: string;
  targetId: string;
  createdAt: string;
  actor: { id: string; name: string };
  details: Record<string, unknown>;
}
export interface BillingFilters {
  page: number;
  limit: number;
  search?: string;
  tenantId?: string;
  status?: string;
}
export type BillingPage<T> = Paginated<T>;
