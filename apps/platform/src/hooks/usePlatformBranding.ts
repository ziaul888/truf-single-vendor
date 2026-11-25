import { useMutation, useQueryClient } from "@tanstack/react-query";
import { platformBrandingKey } from "@/hooks/usePublicPlatformBranding";
import { platformApi } from "@/lib/platform-api";
import type { PlatformBranding } from "@/lib/platform-branding";
import type { ApiSuccess } from "@/types/api";

export { DEFAULT_PLATFORM_BRANDING, type PlatformBranding } from "@/lib/platform-branding";

export { usePlatformBranding } from "@/hooks/usePublicPlatformBranding";

export function useSavePlatformBranding() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (body: FormData) =>
      (await platformApi.put<ApiSuccess<PlatformBranding>>("/branding", body)).data.data,
    onMutate: () => cache.cancelQueries({ queryKey: platformBrandingKey }),
    onSuccess: (branding) => cache.setQueryData(platformBrandingKey, branding),
  });
}
