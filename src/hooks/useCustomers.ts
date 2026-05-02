import { useQuery } from "@tanstack/react-query";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  since: string;
  bookings: number;
  totalSpent: number;
  lastBooking: string;
  dueAmount: number;
  tag: "VIP" | "Regular" | "New";
}

export interface CustomerStats {
  total: number;
  newThisMonth: number;
  withDuePayments: number;
  totalDueAmount: number;
  totalRevenue: number;
}

export function useCustomers() {
  return useQuery<{ customers: Customer[]; stats: CustomerStats }>({
    queryKey: ["customers"],
    queryFn: async () => {
      const res  = await fetch("/api/customers");
      const json = await res.json();
      return json.data;
    },
  });
}
