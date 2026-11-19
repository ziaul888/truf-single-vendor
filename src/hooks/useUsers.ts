import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDashboardApi } from "./useDashboardApi";
import type { CreateUserInput, ResetPasswordInput, UpdateUserInput, UserRole } from "@/validations/user";

/** A staff account as turf-api returns it (admin-only endpoints). */
export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersPage {
  data: StaffUser[];
  total: number;
  page: number;
  limit: number;
}

const USERS_KEY = ["admin", "users"] as const;

export function useUsers(params: { page: number; limit: number; search: string }, { enabled = true } = {}) {
  const { client, scope } = useDashboardApi();
  return useQuery<UsersPage>({
    queryKey: [...scope, ...USERS_KEY, params],
    queryFn: async () => {
      const search = params.search.trim() || undefined;
      const { data } = await client.get("/admin/users", { params: { ...params, search } });
      return data.data;
    },
    placeholderData: keepPreviousData,
    retry: false,
    enabled,
  });
}

function useUsersMutation<TVars>(fn: (vars: TVars) => Promise<StaffUser>) {
  const queryClient = useQueryClient();
  const { scope } = useDashboardApi();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...scope, ...USERS_KEY] });
      // An admin may have edited their own name or email.
      queryClient.invalidateQueries({ queryKey: scope.length ? ["owner", "me"] : ["auth", "me"] });
    },
  });
}

export function useCreateUser() {
  const { client } = useDashboardApi();
  return useUsersMutation(async (body: CreateUserInput) => (await client.post("/admin/users", body)).data.data);
}

/** Sends only the fields that changed — PATCH needs at least one. */
export function useUpdateUser() {
  const { client } = useDashboardApi();
  return useUsersMutation(
    async ({ id, changes }: { id: string; changes: Partial<UpdateUserInput> }) =>
      (await client.patch(`/admin/users/${id}`, changes)).data.data,
  );
}

export function useResetUserPassword() {
  const { client } = useDashboardApi();
  return useUsersMutation(
    async ({ id, body }: { id: string; body: ResetPasswordInput }) =>
      (await client.post(`/admin/users/${id}/reset-password`, body)).data.data,
  );
}

export function useChangePassword() {
  const { client } = useDashboardApi();
  return useMutation({
    mutationFn: async (body: { currentPassword: string; newPassword: string }) =>
      (await client.post("/admin/auth/change-password", body)).data.data as { passwordChanged: true },
  });
}
