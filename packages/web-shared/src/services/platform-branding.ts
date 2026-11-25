import "server-only";

import { cache } from "react";
import { unstable_rethrow } from "next/navigation";
import { DEFAULT_PLATFORM_BRANDING, type PlatformBranding } from "../lib/platform-branding";

const API_TARGET = process.env.API_PROXY_TARGET ?? "http://localhost:4000";

export async function getBranding<T>(path: string, cookie?: string): Promise<T | undefined> {
  try {
    const response = await fetch(new URL(path, API_TARGET), {
      cache: "no-store",
      headers: cookie ? { Cookie: cookie } : undefined,
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) return;
    const result = await response.json();
    if (result.success) return result.data;
  } catch (error) {
    unstable_rethrow(error);
  }
}

export const getPlatformBranding = cache(async () =>
  (await getBranding<PlatformBranding>("/api/v1/platform/branding")) ?? DEFAULT_PLATFORM_BRANDING
);
