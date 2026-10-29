"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "@/components/features/add-booking/section-card";
import { GroundSlotSection } from "@/components/features/add-booking/ground-slot-section";
import { PaymentSection } from "@/components/features/add-booking/payment-section";
import { BookingSummarySidebar } from "@/components/features/add-booking/booking-summary-sidebar";
import {
  CustomerSection, samePhone, toApiPhone, type KnownCustomer,
} from "@/components/features/add-booking/customer-section";
import { takaLabel } from "@/components/features/bookings/booking-status-helpers";
import { useGrounds } from "@/hooks/useGrounds";
import { useAvailableSlots } from "@/hooks/useAddBooking";
import { useCreateBooking } from "@/hooks/useBookings";
import { applyApiErrors, toApiFailure, type ApiFailure } from "@/lib/api-error";
import { toMinorUnits } from "@/lib/ground-format";
import { AddBookingSchema, type AddBookingFormData } from "@/schemas";
import type { CreateBookingInput } from "@/types/booking";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

/** The API reports nested fields ("customer.name"); these are the form fields they belong to. */
const API_FIELD: Record<string, keyof AddBookingFormData> = {
  slotId: "slotId",
  "customer.name": "customerName",
  "customer.phone": "customerPhone",
  "customer.email": "customerEmail",
  "payment.method": "paymentMethod",
  "payment.amount": "advanceAmount",
  "payment.dueDate": "dueDate",
  "payment.note": "partialNote",
  notes: "notes",
};

const toFormFailure = (f: ApiFailure): ApiFailure => ({
  ...f,
  details: f.details?.map((d) => ({ ...d, field: API_FIELD[d.field] ?? d.field })),
});

function toCreateInput(data: AddBookingFormData, known: KnownCustomer | null): CreateBookingInput {
  const phone = toApiPhone(data.customerPhone);
  const customer = {
    ...(known && samePhone(known.phone, phone) ? { id: known.id } : {}),
    name: data.customerName.trim(),
    phone,
    email: data.customerEmail.trim(),
  };
  const note = data.partialNote?.trim() || undefined;
  const payment: CreateBookingInput["payment"] =
    data.paymentType === "none" ? { type: "none" }
    : data.paymentType === "full" ? { type: "full", method: data.paymentMethod }
    : { type: "partial", method: data.paymentMethod, amount: toMinorUnits(data.advanceAmount ?? 0), dueDate: data.dueDate || undefined, note };
  return { slotId: data.slotId, customer, payment, notes: data.notes?.trim() || undefined };
}

export default function AddBookingPage() {
  const router = useRouter();
  const { data: grounds, isLoading: groundsLoading } = useGrounds();
  const createBooking = useCreateBooking();
  const [knownCustomer, setKnownCustomer] = useState<KnownCustomer | null>(null);

  const form = useForm<AddBookingFormData>({
    // Fields use z.coerce, so the schema's input type is looser than the form's.
    resolver: zodResolver(AddBookingSchema) as Resolver<AddBookingFormData>,
    defaultValues: {
      groundId: "", date: "", slotId: "",
      customerName: "", customerPhone: "", customerEmail: "",
      paymentType: "full", paymentMethod: "cash",
      advanceAmount: 0, dueDate: "", partialNote: "", notes: "",
    },
  });

  const { register, watch, setValue, setError, handleSubmit, formState: { errors, isSubmitting } } = form;
  const [groundId, date, slotId, paymentType, paymentMethod, advanceAmount] = [
    watch("groundId"), watch("date"), watch("slotId"),
    watch("paymentType"), watch("paymentMethod"), Number(watch("advanceAmount") ?? 0),
  ];

  const { data: slots, isLoading: slotsLoading, refetch: refetchSlots } = useAvailableSlots(groundId, date);
  const selectedGround = grounds?.find((g) => g.id === groundId);
  const selectedSlot   = slots?.find((s) => s.id === slotId);
  // The slot's own price covers slot length and peak hours; fall back to the hourly price.
  const totalAmount    = selectedSlot?.price ?? selectedGround?.pricePerHour ?? 0;
  const slotHours      = (selectedGround?.slotDurationMinutes ?? 60) / 60;

  function handleApiError(err: unknown) {
    const failure = toApiFailure(err);
    if (failure.code === "SLOT_NOT_AVAILABLE") {
      setValue("slotId", "");
      refetchSlots();
      toast.error("That slot was just taken. Pick another one.");
      return;
    }
    if (failure.code === "CUSTOMER_NOT_FOUND") setKnownCustomer(null);
    const landed = applyApiErrors(form, toFormFailure(failure), { PAYMENT_EXCEEDS_DUE: "advanceAmount", SLOT_IN_PAST: "slotId" });
    if (!landed) toast.error(failure.error);
  }

  async function onSubmit(data: AddBookingFormData) {
    if (!selectedSlot) return setError("slotId", { message: "Select a time slot" });
    if (data.paymentType === "partial" && (data.advanceAmount ?? 0) >= totalAmount) {
      return setError("advanceAmount", { message: `Advance must be less than ${takaLabel(totalAmount)}` });
    }
    try {
      const booking = await createBooking.mutateAsync(toCreateInput(data, knownCustomer));
      toast.success(`Booking ${booking.bookingNumber} created`);
      router.push(`/dashboard/bookings/${booking.id}`);
    } catch (err) {
      handleApiError(err);
    }
  }

  const submitting = isSubmitting || createBooking.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-xl" asChild>
          <Link href="/dashboard/bookings"><ChevronLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Booking</h1>
          <p className="text-sm text-muted-foreground">Book a slot for a walk-in or phone customer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <GroundSlotSection form={form} grounds={grounds} groundsLoading={groundsLoading} slots={slots} slotsLoading={slotsLoading} />
            <CustomerSection form={form} onCustomerFound={setKnownCustomer} />

            {selectedGround && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-6 py-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/70">Booking Summary</p>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-xs text-muted-foreground">Price / Hour</p>
                      <p className="mt-0.5 text-lg font-semibold">{takaLabel(selectedGround.pricePerHour)}</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="mt-0.5 text-lg font-semibold">{selectedSlot ? (slotHours === 1 ? "1 hour" : `${slotHours} hours`) : "—"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="mt-0.5 text-3xl font-bold text-primary">{takaLabel(totalAmount)}</p>
                  </div>
                </div>
              </div>
            )}

            <PaymentSection form={form} totalAmount={totalAmount} />

            <SectionCard n="4" title="Notes" desc="Optional note for staff; the customer doesn't see it">
              <div className="space-y-2">
                <Label htmlFor="notes" className="sr-only">Notes</Label>
                <Textarea id="notes" rows={3} className="resize-none text-sm" placeholder="e.g. Bringing their own ball" {...register("notes")} />
                {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
              </div>
            </SectionCard>

            <div className="flex items-center justify-end gap-3 pb-4">
              <Button variant="outline" className="h-10 px-6" asChild>
                <Link href="/dashboard/bookings">Cancel</Link>
              </Button>
              <Button type="submit" className="h-10 px-8" disabled={submitting}>
                {submitting ? "Creating…" : "Create Booking"}
              </Button>
            </div>
          </div>

          <div className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-6">
              <BookingSummarySidebar ground={selectedGround} slot={selectedSlot} date={date}
                paymentType={paymentType} paymentMethod={paymentMethod} advanceAmount={advanceAmount} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
