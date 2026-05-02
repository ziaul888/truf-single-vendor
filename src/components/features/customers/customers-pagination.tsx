"use client";

import { Button } from "@/components/ui/button";

const PAGE_SIZE = 7;

export function CustomersPagination({
  page,
  totalPages,
  total,
  filtered,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  filtered: number;
  onChange: (p: number) => void;
}) {
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, filtered);

  const pages: (number | "…")[] = totalPages <= 6
    ? Array.from({ length: totalPages }, (_, i) => i + 1)
    : [1, 2, 3, "…", totalPages];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4 pt-3">
      <p className="text-sm text-muted-foreground">
        Showing {start}–{end} of {filtered}{filtered !== total ? ` (filtered from ${total})` : ""} customers
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={page === 1}>Prev</Button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={i} className="px-1.5 text-sm text-muted-foreground">…</span>
          ) : (
            <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => onChange(p as number)}>{p}</Button>
          )
        )}
        <Button variant="outline" size="sm" onClick={() => onChange(page + 1)} disabled={page === totalPages}>Next</Button>
      </div>
    </div>
  );
}
