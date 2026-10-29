"use client";

import { Button } from "@/components/ui/button";
import { pageWindow } from "@/components/features/slots/slot-list-section";

interface BookingsPaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  /** "bookings", "requests" */
  noun?: string;
}

export function BookingsPagination({ page, limit, total, onPageChange, noun = "bookings" }: BookingsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
      <p className="text-sm text-muted-foreground">
        Showing {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} {noun}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>Prev</Button>
          {pageWindow(page, totalPages).map((p) => (
            <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => onPageChange(p)}>{p}</Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>Next</Button>
        </div>
      )}
    </div>
  );
}
