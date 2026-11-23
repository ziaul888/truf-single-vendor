import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { platformApi } from "@/lib/platform-api";
import type { ApiSuccess } from "@/types/api";

export interface PlatformBranding {
  title: string;
  subtitle: string;
  logoUrl: string | null;
}

export const DEFAULT_PLATFORM_BRANDING: PlatformBranding = {
  title: "SaaS Admin",
  subtitle: "Platform administration",
  logoUrl: null,
};

const queryKey = ["platform", "branding"];

export function usePlatformBranding() {
  return useQuery({
    queryKey,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: async ({ signal }) =>
      (await axios.get<ApiSuccess<PlatformBranding>>("/api/v1/platform/branding", { signal })).data
        .data,
  });
}

export function useSavePlatformBranding() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (body: FormData) =>
      (await platformApi.put<ApiSuccess<PlatformBranding>>("/branding", body)).data.data,
    onMutate: () => cache.cancelQueries({ queryKey }),
    onSuccess: (branding) => cache.setQueryData(queryKey, branding),
  });
}
