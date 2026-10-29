"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import {
  CUSTOMER_FORM_FIELDS, CustomerFormFields, CustomerFormSchema, type CustomerFormData,
} from "./customer-form-fields";

const EMPTY: CustomerFormData = { name: "", phone: "", email: "", adminNote: "" };

export function AddCustomerDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const form = useForm<CustomerFormData>({ resolver: zodResolver(CustomerFormSchema), defaultValues: EMPTY });
  const create = useCreateCustomer();

  const onSubmit = form.handleSubmit((d) => {
    const adminNote = d.adminNote.trim();
    create.mutate(
      { name: d.name, phone: d.phone, email: d.email, ...(adminNote ? { adminNote } : {}) },
      {
        onSuccess: (customer) => {
          toast.success(`${customer.name} added successfully`);
          form.reset(EMPTY);
          onOpenChange(false);
        },
        onError: (err) => {
          const failure = toApiFailure(err);
          const placed = applyApiErrors(form, failure, { CUSTOMER_PHONE_TAKEN: "phone" }, CUSTOMER_FORM_FIELDS);
          if (!placed) toast.error(failure.error);
        },
      },
    );
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle>Add customer</SheetTitle>
          <SheetDescription>Register a new customer in the system</SheetDescription>
        </SheetHeader>

        <SheetBody>
          <form id="add-customer-form" onSubmit={onSubmit} className="space-y-5">
            <CustomerFormFields form={form} idPrefix="add-c" />
          </form>
        </SheetBody>

        <SheetFooter>
          <Button type="submit" form="add-customer-form" className="w-full" disabled={create.isPending}>
            {create.isPending ? "Saving…" : "Save customer"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full" onClick={() => form.reset(EMPTY)}>Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
