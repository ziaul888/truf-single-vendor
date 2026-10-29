import { AlertTriangle } from "lucide-react";

/** The red "Block summary" box under the block form. */
export function BlockSummary({ rows }: { rows: [string, string][] }) {
  return (
    <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 space-y-2 text-sm">
      <p className="font-semibold text-red-800 dark:text-red-300">Block summary</p>
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3">
          <span className="text-red-700 dark:text-red-400">{k}</span>
          <span className="text-right font-semibold capitalize text-red-800 dark:text-red-200">{v}</span>
        </div>
      ))}
    </div>
  );
}

/** An amber warning line in the block form. */
export function BlockWarning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-300">
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
      <span>{children}</span>
    </div>
  );
}
