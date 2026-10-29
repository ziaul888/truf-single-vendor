"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findCustomerByPhone } from "@/hooks/useCustomers";
import { toApiFailure } from "@/lib/api-error";
import type { AddBookingFormData } from "@/schemas";
import { toast } from "sonner";
import { CustomerSearchBar } from "./customer-search-bar";
import { SectionCard } from "./section-card";

export interface KnownCustomer { id: string; phone: string }

/** "+8801711000000" / "8801711…" → "1711000000", for the field that shows a +880 prefix. */
export const toLocalPhone = (phone: string) => phone.replace(/\D/g, "").replace(/^880/, "");

/** What the API gets: a leading 0 stays a local number, otherwise the +880 prefix shown in the field applies. */
export function toApiPhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) return digits;
  return digits.startsWith("880") ? `+${digits}` : `+880${digits}`;
}

/** Same phone? Compares the last 10 digits, so 017…, +88017… and 17… all match. */
export const samePhone = (a: string, b: string) => a.replace(/\D/g, "").slice(-10) === b.replace(/\D/g, "").slice(-10);

interface CustomerSectionProps {
  form: UseFormReturn<AddBookingFormData>;
  /** The customer record the lookup found, or null; its id goes with the booking. */
  onCustomerFound: (c: KnownCustomer | null) => void;
}

export function CustomerSection({ form, onCustomerFound }: CustomerSectionProps) {
  const { register, setValue, clearErrors, formState: { errors } } = form;
  const [phoneSearch, setPhoneSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState<"idle" | "found" | "notfound">("idle");
  const [foundName, setFoundName] = useState("");

  async function handlePhoneSearch() {
    if (phoneSearch.replace(/\D/g, "").length < 8) return;
    setSearching(true);
    setStatus("idle");
    try {
      const customer = await findCustomerByPhone(phoneSearch);
      if (!customer) {
        onCustomerFound(null);
        setStatus("notfound");
        setValue("customerPhone", toLocalPhone(phoneSearch));
        return;
      }
      setValue("customerName", customer.name);
      setValue("customerEmail", customer.email);
      setValue("customerPhone", toLocalPhone(customer.phone));
      clearErrors(["customerName", "customerEmail", "customerPhone"]);
      onCustomerFound({ id: customer.id, phone: customer.phone });
      setFoundName(customer.name);
      setStatus("found");
    } catch (err) {
      toast.error(toApiFailure(err).error);
    } finally {
      setSearching(false);
    }
  }

  return (
    <SectionCard n="2" title="Customer Information" desc="Search by phone to auto-fill, or enter details manually">
      <div className="space-y-5">
        <CustomerSearchBar
          value={phoneSearch}
          onChange={(v) => { setPhoneSearch(v); setStatus("idle"); }}
          onSearch={handlePhoneSearch}
          searching={searching}
          customerStatus={status}
          foundName={foundName}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="customerName">Full Name <span className="text-destructive">*</span></Label>
            <Input id="customerName" className="h-10" placeholder="e.g. Rahim Uddin" {...register("customerName")} />
            {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="customerPhone">Phone Number <span className="text-destructive">*</span></Label>
            <div className="flex">
              <span className="flex select-none items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">+880</span>
              <Input id="customerPhone" type="tel" className="h-10 rounded-l-none" placeholder="1711234567" {...register("customerPhone")} />
            </div>
            {errors.customerPhone && <p className="text-xs text-destructive">{errors.customerPhone.message}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium" htmlFor="customerEmail">Email Address <span className="text-destructive">*</span></Label>
          <Input id="customerEmail" type="email" className="h-10" placeholder="customer@example.com" {...register("customerEmail")} />
          {errors.customerEmail && <p className="text-xs text-destructive">{errors.customerEmail.message}</p>}
        </div>
      </div>
    </SectionCard>
  );
}
