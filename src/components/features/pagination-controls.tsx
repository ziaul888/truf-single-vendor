"use client";

import { Button } from "@/components/ui/button";

export function PaginationControls({ page, totalPages, onChange, disabled = false }: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index);

  return (
    <nav aria-label="Pagination" className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:w-auto sm:gap-1">
      <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={disabled || page <= 1}>
        Prev
      </Button>
      <span className="text-center text-sm tabular-nums text-muted-foreground sm:hidden" aria-live="polite">
        Page {page} of {totalPages}
      </span>
      {pages.map((number) => (
        <Button
          key={number}
          variant={number === page ? "default" : "outline"}
          size="sm"
          className="hidden h-8 w-8 p-0 sm:inline-flex"
          aria-label={`Page ${number}`}
          aria-current={number === page ? "page" : undefined}
          disabled={disabled}
          onClick={() => onChange(number)}
        >
          {number}
        </Button>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange(page + 1)} disabled={disabled || page >= totalPages}>
        Next
      </Button>
    </nav>
  );
}
