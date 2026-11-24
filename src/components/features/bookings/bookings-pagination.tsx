"use client";

import { PaginationControls } from "@/components/features/pagination-controls";

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
      <PaginationControls page={page} totalPages={totalPages} onChange={onPageChange} />
    </div>
  );
}
