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
    setupComplete: boolean;
  };
}
