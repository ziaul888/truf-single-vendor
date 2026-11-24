"use client";

import { PaginationControls } from "@/components/features/pagination-controls";

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
      <PaginationControls page={page} totalPages={totalPages} onChange={onChange} />
    </div>
  );
}
