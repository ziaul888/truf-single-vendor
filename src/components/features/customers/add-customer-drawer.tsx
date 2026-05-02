"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { User, Phone, Mail, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const AddCustomerSchema = z.object({
  name:      z.string().min(2, "At least 2 characters"),
  phone:     z.string().min(10, "Enter a valid phone number"),
  email:     z.string().email("Enter a valid email"),
  since:     z.string().min(1, "Required"),
  tag:       z.enum(["VIP", "Regular", "New"]),
  adminNote: z.string().optional(),
});
type AddCustomerFormData = z.infer<typeof AddCustomerSchema>;

const TAG_OPTIONS: { value: AddCustomerFormData["tag"]; label: string; desc: string; activeCls: string }[] = [
  { value: "VIP",     label: "VIP",     desc: "10+ bookings", activeCls: "bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400" },
  { value: "Regular", label: "Regular", desc: "3–9 bookings", activeCls: "bg-blue-100  dark:bg-blue-900/40  border-blue-400  dark:border-blue-600  text-blue-700  dark:text-blue-400"  },
  { value: "New",     label: "New",     desc: "1–2 bookings", activeCls: "bg-green-100 dark:bg-green-900/40 border-green-400 dark:border-green-600 text-green-700 dark:text-green-400" },
];

export function AddCustomerDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<AddCustomerFormData>({
    resolver: zodResolver(AddCustomerSchema),
    defaultValues: { tag: "New", since: new Date().toISOString().split("T")[0] },
  });
  const watchedTag = watch("tag");

  const mutation = useMutation({
    mutationFn: async (data: AddCustomerFormData) => {
      const res  = await fetch("/api/customers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed");
      return json.data;
    },
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(`${customer.name} added successfully`);
      reset();
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(err.message ?? "Failed to add customer"),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle>Add customer</SheetTitle>
          <SheetDescription>Register a new customer in the system</SheetDescription>
        </SheetHeader>

        <SheetBody>
          <form id="add-customer-form" onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-semibold flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-muted-foreground" /> Personal information</p>
              <div className="space-y-1.5">
                <Label htmlFor="c-name">Full name <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input id="c-name" placeholder="e.g. Rahim Khan" className="pl-9" {...register("name")} />
                </div>
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-phone">Phone <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input id="c-phone" placeholder="+880 1712 345678" className="pl-9" {...register("phone")} />
                </div>
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                <p className="text-[11px] text-muted-foreground">Must be unique — used for booking lookup</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-email">Email <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input id="c-email" type="email" placeholder="customer@example.com" className="pl-9" {...register("email")} />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-since">Registration date <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input id="c-since" type="date" className="pl-9" {...register("since")} />
                </div>
                {errors.since && <p className="text-xs text-destructive">{errors.since.message}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Customer tag</p>
              <div className="grid grid-cols-3 gap-2">
                {TAG_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setValue("tag", opt.value)}
                    className={cn("rounded-xl border-2 p-3 text-left transition-all", watchedTag === opt.value ? opt.activeCls : "border-muted hover:border-muted-foreground/40")}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-xs">{opt.label}</span>
                      {watchedTag === opt.value && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                    <p className="text-[10px] opacity-60">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="c-note" className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Admin note
                <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </Label>
              <textarea id="c-note" rows={3} placeholder="e.g. Prefers morning slots"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                {...register("adminNote")} />
              <p className="text-[11px] text-muted-foreground">Only visible to admins.</p>
            </div>
          </form>
        </SheetBody>

        <SheetFooter>
          <Button type="submit" form="add-customer-form" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save customer"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full" onClick={() => reset()}>Cancel</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
