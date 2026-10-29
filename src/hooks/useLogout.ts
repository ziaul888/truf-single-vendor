import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

/** Ends the session on the API, then drops all cached data so the next user starts clean. */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    // Logout always succeeds on the API; a network failure still sends the user to /login.
    await fetch("/api/v1/admin/auth/logout", { method: "POST" }).catch(() => undefined);
    queryClient.clear();
    router.push("/login");
    router.refresh();
  }

  return { logout, loggingOut };
}
