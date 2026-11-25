import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { DashboardAudience } from "./useMe";

/** Ends the session on the API, then drops all cached data so the next user starts clean. */
export function useLogout(audience: DashboardAudience = "staff") {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout(turfSlug?: string) {
    setLoggingOut(true);
    // Logout always succeeds on the API; a network failure still sends the user to /login.
    const endpoint =
      audience === "owner" ? "/api/v1/owner/auth/logout" : "/api/v1/admin/auth/logout";
    await fetch(endpoint, { method: "POST" }).catch(() => undefined);
    queryClient.clear();
    router.push(turfSlug ? `/login?turf=${encodeURIComponent(turfSlug)}` : "/login");
    router.refresh();
  }

  return { logout, loggingOut };
}
