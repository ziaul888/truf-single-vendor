import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDashboardApi } from "./useDashboardApi";
import type { Customer, CustomerDetail, CustomerPage, CustomerSort, CustomerTag } from "@/types/booking";

export type { Customer, CustomerDetail };

export interface CustomerFilters {
  search?: string;
  tag?: CustomerTag;
  hasDue?: boolean;
  /** Always high → low. */
  sort?: CustomerSort;
  page?: number;
  limit?: number;
}

const CUSTOMERS_KEY = ["customers"] as const;

export function useCustomers(filters: CustomerFilters = {}, { enabled = true } = {}) {
  const { client, scope } = useDashboardApi();
  return useQuery<CustomerPage>({
    queryKey: [...scope, ...CUSTOMERS_KEY, "list", filters],
    queryFn: async () => {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""));
      return (await client.get("/admin/customers", { params })).data.data;
    },
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCustomerDetail(id: string | undefined) {
  const { client, scope } = useDashboardApi();
  return useQuery<CustomerDetail>({
    queryKey: [...scope, ...CUSTOMERS_KEY, "detail", id],
    queryFn: async () => (await client.get(`/admin/customers/${id}`)).data.data,
    enabled: !!id,
    retry: false,
  });
}

/** Finds a customer by phone (any format) to fill the New Booking form; null when unknown. */
export function useFindCustomerByPhone() {
  const { client } = useDashboardApi();
  return async (phone: string) => {
    const { data } = await client.get("/admin/customers/search", { params: { phone } });
    return data.data as Pick<Customer, "id" | "name" | "phone" | "email"> | null;
  };
}

function useCustomerMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) {
  const { scope } = useDashboardApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: [...scope, ...CUSTOMERS_KEY] }),
  });
}

export function useCreateCustomer() {
  const { client } = useDashboardApi();
  return useCustomerMutation(async (body: { name: string; phone: string; email?: string; adminNote?: string }) =>
    (await client.post("/admin/customers", body)).data.data as Customer);
}

export function useUpdateCustomer() {
  const { client } = useDashboardApi();
  return useCustomerMutation(
    async ({ id, ...body }: { id: string; name?: string; phone?: string; email?: string | null; adminNote?: string | null }) =>
      (await client.patch(`/admin/customers/${id}`, body)).data.data as Customer,
  );
}

/** Admin only; soft delete. 409 CUSTOMER_HAS_UPCOMING_BOOKINGS. */
export function useDeleteCustomer() {
  const { client } = useDashboardApi();
  return useCustomerMutation(async (id: string) =>
    (await client.delete(`/admin/customers/${id}`)).data.data as { deleted: true });
}
