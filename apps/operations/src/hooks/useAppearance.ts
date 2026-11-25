import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Appearance } from "@/lib/appearance";
import { ownerApi } from "@/lib/owner-api";
import { platformApi } from "@/lib/platform-api";
import type { ApiSuccess } from "@/types/api";

export type AppearanceScope = "platform" | "turf";

const endpoints = {
  platform: { client: platformApi, path: "/appearance" },
  turf: { client: ownerApi, path: "/admin/settings/appearance" },
};

const queryKeyFor = (scope: AppearanceScope, id?: string) => ["appearance", scope, id];

export function useAppearance(scope: AppearanceScope, id?: string) {
  const { client, path } = endpoints[scope];
  return useQuery({
    queryKey: queryKeyFor(scope, id),
    enabled: !!id,
    retry: false,
    refetchOnWindowFocus: true,
    queryFn: async ({ signal }) =>
      (await client.get<ApiSuccess<Appearance>>(path, { signal })).data.data,
  });
}

export function useSaveAppearance(scope: AppearanceScope, id: string) {
  const { client, path } = endpoints[scope];
  const cache = useQueryClient();
  const queryKey = queryKeyFor(scope, id);
  return useMutation({
    mutationFn: async (settings: Appearance) =>
      (await client.put<ApiSuccess<Appearance>>(path, settings)).data.data,
    onMutate: () => cache.cancelQueries({ queryKey }),
    onSuccess: (appearance) => cache.setQueryData(queryKey, appearance),
  });
}
