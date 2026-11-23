import "server-only";

import { unstable_rethrow } from "next/navigation";
import { DEFAULT_SAAS_SCREENSHOTS, type SaasScreenshots } from "@/lib/saas-screenshots";
import type { ApiSuccess } from "@/types/api";

export async function getSaasScreenshots(): Promise<SaasScreenshots> {
  const api = process.env.API_PROXY_TARGET ?? "http://localhost:4000";
  try {
    const response = await fetch(new URL("/api/v1/platform/landing-screenshots", api), {
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    if (response.ok) {
      const result = (await response.json()) as ApiSuccess<SaasScreenshots>;
      if (result.success) return result.data;
    }
  } catch (error) {
    unstable_rethrow(error);
  }
  return DEFAULT_SAAS_SCREENSHOTS;
}
