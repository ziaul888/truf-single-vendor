export interface OwnerUser {
  id: string;
  name: string;
  email: string;
  role: "owner";
  audience: "owner";
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: "draft" | "active" | "suspended" | "archived";
    timezone: string;
    currency: string;
  };
}
export interface OwnerBilling {
  subscription: {
    id: string;
    planName: string;
    interval: "monthly" | "yearly";
    amount: number;
    currency: string;
    startDate: string;
    paidThrough: string | null;
    status: string;
    cancelAtPeriodEnd: boolean;
  } | null;
  invoices: {
    id: string;
    number: string;
    planName: string;
    amount: number;
    currency: string;
    interval: string;
    periodStart: string;
    periodEnd: string;
    dueOn: string;
    status: string;
    createdAt: string;
  }[];
}
export interface OwnerAccessState {
  status: "unassigned" | "pending" | "invited" | "active" | "existing_account" | "inactive";
  canInvite: boolean;
  invitationExpiresAt: string | null;
}
export interface OwnerInvitation {
  invitationId: string;
  token: string | null;
  expiresAt: string;
}
export interface OwnerActivationPreview {
  ownerName: string;
  email: string;
  turfName: string;
  expiresAt: string;
}
