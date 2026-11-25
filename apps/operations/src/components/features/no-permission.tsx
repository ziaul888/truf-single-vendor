import { ShieldAlert } from "lucide-react";

/** Shown to managers on admin-only pages. The API enforces roles anyway; this just explains it. */
export function NoPermission({ reason }: { reason: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <ShieldAlert className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-semibold text-foreground">You don&apos;t have permission to view this page.</p>
      <p className="mt-1 text-sm text-muted-foreground">{reason}</p>
    </div>
  );
}
