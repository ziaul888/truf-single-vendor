import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { platformApi } from "@/lib/platform-api";
import { resizeImage } from "@/lib/resize-image";
import {
  DEFAULT_SAAS_SCREENSHOTS,
  type SaasScreenshots,
  type SaasScreenshotSlot,
} from "@/lib/saas-screenshots";
import { WEBSITE_IMAGE_MAX_UPLOAD_BYTES } from "@/validations/website-settings";
import type { ApiSuccess } from "@/types/api";

const path = "/landing-screenshots";
const queryKey = ["platform", "landing-screenshots"];
type SavedImage = ApiSuccess<{ imageUrl: string | null }>;

export function useSaasScreenshots() {
  return useQuery({
    queryKey,
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: async ({ signal }) =>
      (await axios.get<ApiSuccess<SaasScreenshots>>(`/api/v1/platform${path}`, { signal })).data
        .data,
  });
}

export function useSaveSaasScreenshot(slot: SaasScreenshotSlot) {
  const cache = useQueryClient();
  const url = `${path}/${slot}`;
  return useMutation({
    mutationFn: async (file: File | null) => {
      if (!file) return (await platformApi.delete<SavedImage>(url)).data.data;
      const image = file.size > WEBSITE_IMAGE_MAX_UPLOAD_BYTES ? await resizeImage(file) : file;
      if (image.size > WEBSITE_IMAGE_MAX_UPLOAD_BYTES) {
        throw new Error("Choose a smaller image. This file is still over 2 MB after resizing.");
      }
      const body = new FormData();
      body.set("image", image);
      return (await platformApi.put<SavedImage>(url, body)).data.data;
    },
    onMutate: () => cache.cancelQueries({ queryKey }),
    onSuccess: ({ imageUrl }) =>
      cache.setQueryData<SaasScreenshots>(queryKey, (current) => ({
        ...(current ?? DEFAULT_SAAS_SCREENSHOTS),
        [slot]: imageUrl,
      })),
  });
}
