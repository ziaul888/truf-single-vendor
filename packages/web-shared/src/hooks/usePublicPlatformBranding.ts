import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { PlatformBranding } from "../lib/platform-branding";
import type { ApiSuccess } from "../types/api";

export const platformBrandingKey = ["platform", "branding"];

export function usePlatformBranding() {
  return useQuery({
    queryKey: platformBrandingKey,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: async ({ signal }) =>
      (await axios.get<ApiSuccess<PlatformBranding>>("/api/v1/platform/branding", { signal })).data
        .data,
  });
}
