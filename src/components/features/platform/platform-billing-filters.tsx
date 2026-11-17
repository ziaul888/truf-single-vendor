"use client";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
export function PlatformBillingFilters({
  search,
  status,
  statuses,
  onSearch,
  onStatus,
  tenantId,
  onClearTenant,
}: {
  search: string;
  status: string;
  statuses: Record<string, string>;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  tenantId?: string;
  onClearTenant: () => void;
}) {
  return (
    <div className="bg-card flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Label htmlFor="billing-search" className="sr-only">
          Search billing records
        </Label>
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          id="billing-search"
          className="pl-10"
          maxLength={100}
          placeholder="Search turf, plan or invoice"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="sm:w-48">
        <Label htmlFor="billing-status" className="sr-only">
          Billing status
        </Label>
        <Select value={status} onValueChange={onStatus}>
          <SelectTrigger id="billing-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(statuses).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {tenantId && (
        <Button variant="ghost" className="h-11" onClick={onClearTenant}>
          <X />
          Clear turf filter
        </Button>
      )}
    </div>
  );
}
