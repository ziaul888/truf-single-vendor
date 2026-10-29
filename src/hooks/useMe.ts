import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager";
}

/** The signed-in admin user. A 401 redirects to /login via the api interceptor. */
export function useMe() {
  return useQuery<AdminUser>({
    queryKey: ["auth", "me"],
    queryFn: async () => (await api.get("/admin/auth/me")).data.data,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
