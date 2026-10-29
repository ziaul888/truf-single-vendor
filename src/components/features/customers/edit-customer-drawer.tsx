"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { useUpdateCustomer } from "@/hooks/useCustomers";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import type { Customer } from "@/types/booking";
import {
  CUSTOMER_FORM_FIELDS, CustomerFormFields, CustomerFormSchema, type CustomerFormData,
} from "./customer-form-fields";

const toForm = (c: Customer): CustomerFormData => ({
  name: c.name, phone: c.phone, email: c.email, adminNote: c.adminNote ?? "",
});

/** Mount only while open so the form starts from the saved values each time. */
export function EditCustomerDrawer({
  customer, open, onOpenChange,
}: {
  customer: Customer;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const form = useForm<CustomerFormData>({ resolver: zodResolver(CustomerFormSchema), defaultValues: toForm(customer) });
  const update = useUpdateCustomer();

  const onSubmit = form.handleSubmit((d) => {
    const adminNote = d.adminNote.trim();
    update.mutate(
      { id: customer.id, name: d.name, phone: d.phone, email: d.email, adminNote: adminNote || null },
      {
        onSuccess: () => {
          toast.success("Customer updated");
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
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Update {customer.name}&apos;s contact details and admin note</SheetDescription>
        </SheetHeader>

        <SheetBody>
          <form id="edit-customer-form" onSubmit={onSubmit} className="space-y-5">
            <CustomerFormFields form={form} idPrefix="edit-c" />
          </form>
        </SheetBody>

        <SheetFooter>
          <Button type="submit" form="edit-customer-form" className="w-full" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save changes"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
