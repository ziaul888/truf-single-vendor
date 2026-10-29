"use client";

import { useRouter } from "next/navigation";
import { groundsHref, type GroundSort, type GroundsQuery } from "./grounds-query";

const OPTIONS: { value: GroundSort; label: string }[] = [
  { value: "recommended", label: "Sort: Recommended" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
  { value: "format", label: "Format: Smallest first" },
];

export function GroundsSortSelect({ query }: { query: GroundsQuery }) {
  const router = useRouter();
  return (
    <select
      aria-label="Sort grounds"
      value={query.sort}
      onChange={(e) => router.push(groundsHref(query, { sort: e.target.value as GroundSort }))}
      className="rounded-lg border bg-card px-3 py-2 text-sm"
    >
      {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
