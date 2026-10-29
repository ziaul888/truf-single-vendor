import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
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
  return useQuery<CustomerPage>({
    queryKey: [...CUSTOMERS_KEY, "list", filters],
    queryFn: async () => {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""));
      return (await api.get("/admin/customers", { params })).data.data;
    },
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCustomerDetail(id: string | undefined) {
  return useQuery<CustomerDetail>({
    queryKey: [...CUSTOMERS_KEY, "detail", id],
    queryFn: async () => (await api.get(`/admin/customers/${id}`)).data.data,
    enabled: !!id,
    retry: false,
  });
}

/** Finds a customer by phone (any format) to fill the New Booking form; null when unknown. */
export async function findCustomerByPhone(phone: string) {
  const { data } = await api.get("/admin/customers/search", { params: { phone } });
  return data.data as Pick<Customer, "id" | "name" | "phone" | "email"> | null;
}

function useCustomerMutation<TVars, TResult>(fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: CUSTOMERS_KEY }),
  });
}

export function useCreateCustomer() {
  return useCustomerMutation(async (body: { name: string; phone: string; email: string; adminNote?: string }) =>
    (await api.post("/admin/customers", body)).data.data as Customer);
}

export function useUpdateCustomer() {
  return useCustomerMutation(
    async ({ id, ...body }: { id: string; name?: string; phone?: string; email?: string; adminNote?: string | null }) =>
      (await api.patch(`/admin/customers/${id}`, body)).data.data as Customer,
  );
}

/** Admin only; soft delete. 409 CUSTOMER_HAS_UPCOMING_BOOKINGS. */
export function useDeleteCustomer() {
  return useCustomerMutation(async (id: string) =>
    (await api.delete(`/admin/customers/${id}`)).data.data as { deleted: true });
}
