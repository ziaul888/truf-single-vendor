"use client";

import { Button } from "@/components/ui/button";
import { pageWindow } from "@/components/features/slots/slot-list-section";

export function CustomersPagination({
  page,
  limit,
  total,
  onChange,
}: {
  page: number;
  limit: number;
  total: number;
  onChange: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4 pt-3">
      <p className="text-sm text-muted-foreground">
        Showing {start}–{end} of {total} customers
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={page <= 1}>Prev</Button>
        {pageWindow(page, totalPages).map((p) => (
          <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => onChange(p)}>
            {p}
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>Next</Button>
      </div>
    </div>
  );
}
