"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, UserCheck, UserX } from "lucide-react";

type CustomerStatus = "idle" | "found" | "notfound";

export function CustomerSearchBar({
  value,
  onChange,
  onSearch,
  searching,
  customerStatus,
  foundName,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  searching: boolean;
  customerStatus: CustomerStatus;
  foundName: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Search Existing Customer</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-10 pl-9"
            placeholder="Type phone number to search…"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onSearch())}
          />
        </div>
        <Button type="button" variant="outline" className="h-10 shrink-0" onClick={onSearch} disabled={searching || value.length < 8}>
          {searching ? "Searching…" : "Search"}
        </Button>
      </div>

      {customerStatus === "found" && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 dark:border-green-800 dark:bg-green-950/30">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">Customer found</p>
            <p className="text-xs text-green-600 dark:text-green-400">{foundName} — details filled below</p>
          </div>
        </div>
      )}

      {customerStatus === "notfound" && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
            <UserX className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">No customer found</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Enter details manually below</p>
          </div>
        </div>
      )}
    </div>
  );
}
