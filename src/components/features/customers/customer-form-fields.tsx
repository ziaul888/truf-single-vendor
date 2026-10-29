"use client";

import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Mail, FileText } from "lucide-react";

export const CustomerFormSchema = z.object({
  name:      z.string().trim().min(2, "At least 2 characters").max(100, "At most 100 characters"),
  phone:     z.string().trim().min(10, "Enter a valid phone number").max(20, "Enter a valid phone number"),
  email:     z.string().trim().email("Enter a valid email"),
  adminNote: z.string().max(1000, "At most 1000 characters"),
});
export type CustomerFormData = z.infer<typeof CustomerFormSchema>;

export const CUSTOMER_FORM_FIELDS = ["name", "phone", "email", "adminNote"] as const;

/** Name, phone, email and admin note inputs shared by the add and edit drawers. */
export function CustomerFormFields({ form, idPrefix }: { form: UseFormReturn<CustomerFormData>; idPrefix: string }) {
  const { register, formState: { errors } } = form;
  const id = (f: string) => `${idPrefix}-${f}`;

  return (
    <>
      <div className="space-y-3">
        <p className="text-sm font-semibold flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-muted-foreground" /> Personal information</p>
        <div className="space-y-1.5">
          <Label htmlFor={id("name")}>Full name <span className="text-destructive">*</span></Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input id={id("name")} placeholder="e.g. Rahim Khan" className="pl-9" {...register("name")} />
          </div>
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={id("phone")}>Phone <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input id={id("phone")} placeholder="+880 1712 345678" className="pl-9" {...register("phone")} />
          </div>
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          <p className="text-[11px] text-muted-foreground">Must be unique — used for booking lookup</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={id("email")}>Email <span className="text-destructive">*</span></Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input id={id("email")} type="email" placeholder="customer@example.com" className="pl-9" {...register("email")} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={id("note")} className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Admin note
          <span className="text-xs font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea id={id("note")} rows={3} placeholder="e.g. Prefers morning slots" className="resize-none" {...register("adminNote")} />
        {errors.adminNote && <p className="text-xs text-destructive">{errors.adminNote.message}</p>}
        <p className="text-[11px] text-muted-foreground">Only visible to staff.</p>
      </div>
    </>
  );
}
