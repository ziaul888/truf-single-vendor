"use client";

import { Loader2 } from "lucide-react";
import { useMe } from "@/hooks/useMe";
import { NoPermission } from "./no-permission";

/** Renders children for admins; managers see why they can't use the page. */
export function AdminOnly({ reason, children }: { reason: string; children: React.ReactNode }) {
  const { data: me, isLoading } = useMe();
  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (me?.role !== "admin") return <NoPermission reason={reason} />;
  return <>{children}</>;
}
