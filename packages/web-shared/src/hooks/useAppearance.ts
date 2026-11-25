import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import type { Appearance } from "../lib/appearance";
import type { ApiSuccess } from "../types/api";

export interface AppearanceEndpoint {
  scope: "platform" | "turf";
  client: AxiosInstance;
  path: string;
}

const queryKeyFor = (scope: AppearanceEndpoint["scope"], id?: string) => ["appearance", scope, id];

export function useAppearance({ client, path, scope }: AppearanceEndpoint, id?: string) {
  return useQuery({
    queryKey: queryKeyFor(scope, id),
    enabled: !!id,
    retry: false,
    refetchOnWindowFocus: true,
    queryFn: async ({ signal }) =>
      (await client.get<ApiSuccess<Appearance>>(path, { signal })).data.data,
  });
}

export function useSaveAppearance({ client, path, scope }: AppearanceEndpoint, id: string) {
  const cache = useQueryClient();
  const queryKey = queryKeyFor(scope, id);
  return useMutation({
    mutationFn: async (settings: Appearance) =>
      (await client.put<ApiSuccess<Appearance>>(path, settings)).data.data,
    onMutate: () => cache.cancelQueries({ queryKey }),
    onSuccess: (appearance) => cache.setQueryData(queryKey, appearance),
  });
}
