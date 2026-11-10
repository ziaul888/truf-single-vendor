"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MobileActionBar } from "@/components/features/mobile-action-bar";
import { SectionCard } from "@/components/features/add-booking/section-card";
import { GroundSlotSection } from "@/components/features/add-booking/ground-slot-section";
import { PaymentSection } from "@/components/features/add-booking/payment-section";
import { BookingSummarySidebar } from "@/components/features/add-booking/booking-summary-sidebar";
import { CustomerSection, type KnownCustomer } from "@/components/features/add-booking/customer-section";
import { SeriesPreviewCard } from "@/components/features/add-booking/series-preview-card";
import { toCustomerInput, toPatternInput, toSeriesInput } from "@/components/features/add-booking/series-input";
import { takaLabel } from "@/components/features/bookings/booking-status-helpers";
import { useGrounds } from "@/hooks/useGrounds";
import { useAvailableSlots } from "@/hooks/useAddBooking";
import { useCreateBooking } from "@/hooks/useBookings";
import { useCreateSeries, useSeriesPreview } from "@/hooks/useBookingSeries";
import { applyApiErrors, toApiFailure, type ApiFailure } from "@/lib/api-error";
import { fromMinorUnits, toMinorUnits } from "@/lib/ground-format";
import { venueToday } from "@/lib/slot-format";
import { AddBookingSchema, RepeatBookingSchema, type AddBookingFormData } from "@/schemas";
import { isWalletMethod, type CreateBookingInput } from "@/types/booking";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

/** The API reports nested fields ("customer.name"); these are the form fields they belong to. */
const API_FIELD: Record<string, keyof AddBookingFormData> = {
  slotId: "slotId",
  "customer.name": "customerName",
  "customer.phone": "customerPhone",
  "customer.email": "customerEmail",
  "payment.method": "paymentMethod",
  "payment.reference": "paymentReference",
  "payment.amount": "advanceAmount",
  "payment.dueDate": "dueDate",
  "payment.note": "partialNote",
  notes: "notes",
  groundId: "groundId",
  fromDate: "date",
  untilDate: "untilDate",
  weekdays: "weekdays",
  startHour: "startHour",
};

const toFormFailure = (f: ApiFailure): ApiFailure => ({
  ...f,
  details: f.details?.map((d) => ({ ...d, field: API_FIELD[d.field] ?? d.field })),
});

// Fields use z.coerce, so the schemas' input types are looser than the form's.
const bookingResolver = zodResolver(AddBookingSchema) as Resolver<AddBookingFormData>;
const repeatResolver = zodResolver(RepeatBookingSchema) as Resolver<AddBookingFormData>;
/** Repeat on: an hour and weekdays are checked instead of one slot. */
const resolver: Resolver<AddBookingFormData> = (values, context, options) =>
  (values.repeat ? repeatResolver : bookingResolver)(values, context, options);

function toCreateInput(data: AddBookingFormData, known: KnownCustomer | null): CreateBookingInput {
  const customer = toCustomerInput(data, known);
  const note = data.partialNote?.trim() || undefined;
  const reference = isWalletMethod(data.paymentMethod) && data.paymentReference ? data.paymentReference : undefined;
  const payment: CreateBookingInput["payment"] =
    data.paymentType === "none" ? { type: "none" }
    : data.paymentType === "full" ? { type: "full", method: data.paymentMethod, reference }
    : { type: "partial", method: data.paymentMethod, amount: toMinorUnits(data.advanceAmount ?? 0), dueDate: data.dueDate || undefined, reference, note };
  return { slotId: data.slotId, customer, payment, notes: data.notes?.trim() || undefined };
}

export default function AddBookingPage() {
  const router = useRouter();
  const { data: grounds, isLoading: groundsLoading } = useGrounds();
  const createBooking = useCreateBooking();
  const [knownCustomer, setKnownCustomer] = useState<KnownCustomer | null>(null);

  const form = useForm<AddBookingFormData>({
    resolver,
    defaultValues: {
      // Most walk-in and phone bookings are for today.
      groundId: "", date: venueToday(), slotId: "",
      customerName: "", customerPhone: "", customerEmail: "",
      paymentType: "full", paymentMethod: "cash", paymentReference: "",
      advanceAmount: 0, dueDate: "", partialNote: "", notes: "",
      repeat: false, repeatMode: "fixed", weekdays: [], untilDate: "", startHour: "",
    },
  });

  const { register, watch, setValue, setError, handleSubmit, formState: { errors, isSubmitting } } = form;
  const [groundId, date, slotId, paymentType, paymentMethod, advanceAmount] = [
    watch("groundId"), watch("date"), watch("slotId"),
    watch("paymentType"), watch("paymentMethod"), Number(watch("advanceAmount") ?? 0),
  ];
  const [repeat, repeatMode, weekdays, untilDate, startHour] = [
    watch("repeat") ?? false, watch("repeatMode"), watch("weekdays"), watch("untilDate"), watch("startHour"),
  ];

  // With one active ground there is nothing to choose, so it is picked already.
  const activeGrounds = grounds?.filter((g) => g.isActive);
  const onlyGroundId = activeGrounds?.length === 1 ? activeGrounds[0].id : null;
  useEffect(() => {
    if (onlyGroundId && !groundId) setValue("groundId", onlyGroundId);
  }, [onlyGroundId, groundId, setValue]);

  const { data: slots, isLoading: slotsLoading, refetch: refetchSlots } = useAvailableSlots(groundId, date);
  const selectedGround = grounds?.find((g) => g.id === groundId);
  const selectedSlot   = slots?.find((s) => s.id === slotId);

  const patternInput = repeat ? toPatternInput({ groundId, date, repeatMode, weekdays, untilDate, startHour }) : null;
  const preview = useSeriesPreview(patternInput);
  const seriesPreview = patternInput ? preview.data : undefined;
  // Book only from a preview of the current pattern, not the previous one still on screen.
  const previewSettled = !!seriesPreview && !preview.isFetching && !preview.isPlaceholderData;
  const createSeries = useCreateSeries();

  // The slot's own price covers slot length and peak hours; fall back to the hourly price.
  // Repeat: the total of every free date.
  const totalAmount    = repeat ? fromMinorUnits(seriesPreview?.total ?? 0) : selectedSlot?.price ?? selectedGround?.pricePerHour ?? 0;
  const slotHours      = (selectedGround?.slotDurationMinutes ?? 60) / 60;

  function handleApiError(err: unknown) {
    const failure = toApiFailure(err);
    const slotGone: Record<string, string> = {
      SLOT_NOT_AVAILABLE: "That slot was just taken. Pick another one.",
      GROUND_CLOSED: "The ground is closed on that day. Pick another date.",
      SLOT_IN_PAST: "That slot has ended. Pick another one.",
    };
    if (failure.code && slotGone[failure.code]) {
      setValue("slotId", "");
      refetchSlots();
      toast.error(slotGone[failure.code]);
      return;
    }
    if (failure.code === "NOTHING_TO_BOOK") {
      preview.refetch();
      toast.error("None of these dates are free any more. Change the days, time or dates.");
      return;
    }
    if (failure.code === "CUSTOMER_NOT_FOUND") setKnownCustomer(null);
    const landed = applyApiErrors(form, toFormFailure(failure), {
      PAYMENT_EXCEEDS_DUE: "advanceAmount", AMOUNT_EXCEEDS_DUE: "advanceAmount", REFERENCE_ALREADY_USED: "paymentReference",
    });
    if (!landed) toast.error(failure.error);
  }

  async function submitSeries(data: AddBookingFormData) {
    const input = toSeriesInput(data, knownCustomer);
    if (!input) return;
    try {
      const series = await createSeries.mutateAsync(input);
      const first = [...series.bookings].sort((a, b) => a.date.localeCompare(b.date))[0];
      toast.success(`Repeat booking created: ${series.bookings.length} ${series.bookings.length === 1 ? "date" : "dates"} booked`);
      router.push(first ? `/dashboard/bookings/${first.id}` : "/dashboard/bookings");
    } catch (err) {
      handleApiError(err);
    }
  }

  async function onSubmit(data: AddBookingFormData) {
    if (data.repeat && !seriesPreview?.bookableCount) {
      return toast.error("None of these dates are free. Change the days, time or dates.");
    }
    if (!data.repeat && !selectedSlot) return setError("slotId", { message: "Select a time slot" });
    if (data.paymentType === "partial" && (data.advanceAmount ?? 0) >= totalAmount) {
      return setError("advanceAmount", { message: `Advance must be less than ${takaLabel(totalAmount)}` });
    }
    if (data.repeat) return submitSeries(data);
    try {
      const booking = await createBooking.mutateAsync(toCreateInput(data, knownCustomer));
      toast.success(`Booking ${booking.bookingNumber} created`);
      router.push(`/dashboard/bookings/${booking.id}`);
    } catch (err) {
      handleApiError(err);
    }
  }

  const submitting = isSubmitting || createBooking.isPending || createSeries.isPending;
  const bookable = previewSettled ? seriesPreview.bookableCount : 0;
  const submitLabel = submitting ? (repeat ? "Booking…" : "Creating…")
    : !repeat ? "Create Booking" : bookable > 0 ? `Book ${bookable} ${bookable === 1 ? "date" : "dates"}` : "Book dates";
  const submitDisabled = submitting || (repeat && !!patternInput && !previewSettled);
  const previewProps = {
    preview: seriesPreview, ready: !!patternInput, loading: preview.isFetching,
    error: preview.isError ? toApiFailure(preview.error).error : null,
    onRetry: () => { preview.refetch(); }, ongoing: repeatMode === "ongoing",
  };

  return (
    // Room below lg for the pinned submit bar.
    <div className="space-y-6 max-lg:pb-28">
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
            {repeat && <SeriesPreviewCard {...previewProps} className="lg:hidden" />}
            <CustomerSection form={form} onCustomerFound={setKnownCustomer} />

            {selectedGround && !repeat && (
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

            <PaymentSection form={form} totalAmount={totalAmount} hideDueFields={repeat} />

            <SectionCard n="4" title="Notes" desc="Optional note for staff; the customer doesn't see it">
              <div className="space-y-2">
                <Label htmlFor="notes" className="sr-only">Notes</Label>
                <Textarea id="notes" rows={3} className="resize-none" placeholder="e.g. Bringing their own ball" {...register("notes")} />
                {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
              </div>
            </SectionCard>

            <div className="hidden items-center justify-end gap-3 pb-4 lg:flex">
              <Button variant="outline" className="h-10 px-6" asChild>
                <Link href="/dashboard/bookings">Cancel</Link>
              </Button>
              <Button type="submit" className="h-10 px-8" disabled={submitDisabled}>
                {submitLabel}
              </Button>
            </div>
            {/* Inside the form, so it still submits it */}
            <MobileActionBar className="flex gap-2">
              <Button variant="outline" className="h-11 px-5" asChild>
                <Link href="/dashboard/bookings">Cancel</Link>
              </Button>
              <Button type="submit" className="h-11 flex-1" disabled={submitDisabled}>
                {submitLabel}
              </Button>
            </MobileActionBar>
          </div>

          <div className="hidden lg:col-span-1 lg:block">
            <div className={repeat ? "sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto" : "sticky top-6"}>
              {repeat ? <SeriesPreviewCard {...previewProps} /> : (
                <BookingSummarySidebar ground={selectedGround} slot={selectedSlot} date={date}
                  paymentType={paymentType} paymentMethod={paymentMethod} advanceAmount={advanceAmount} />
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
