"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionCard } from "@/components/features/add-booking/section-card";
import { SlotPicker } from "@/components/features/add-booking/slot-picker";
import { PaymentSection } from "@/components/features/add-booking/payment-section";
import { BookingSummarySidebar } from "@/components/features/add-booking/booking-summary-sidebar";
import { CustomerSearchBar } from "@/components/features/add-booking/customer-search-bar";
import { useGrounds } from "@/hooks/useGrounds";
import { useAvailableSlots, useCreateBooking } from "@/hooks/useAddBooking";
import { AddBookingSchema, type AddBookingFormData } from "@/schemas";
import { formatCurrency } from "@/lib/utils";
import { ChevronLeft, CalendarClock } from "lucide-react";
import { toast } from "sonner";

const today = new Date().toISOString().split("T")[0];

export default function AddBookingPage() {
  const router = useRouter();
  const { data: grounds, isLoading: groundsLoading } = useGrounds();
  const createBooking = useCreateBooking();

  const form = useForm<AddBookingFormData>({
    resolver: zodResolver(AddBookingSchema),
    defaultValues: {
      groundId: "", date: "", slotId: "",
      customerName: "", customerPhone: "", customerEmail: "",
      bookingType: "offline", paymentMethod: "cash",
      paymentType: "full", advanceAmount: 0, dueDate: "", partialNote: "",
    },
  });

  const { register, watch, setValue, clearErrors, control, handleSubmit, formState: { errors, isSubmitting } } = form;
  const [groundId, date, slotId, bookingType, paymentType, advanceAmount] = [
    watch("groundId"), watch("date"), watch("slotId"),
    watch("bookingType"), watch("paymentType"), Number(watch("advanceAmount") ?? 0),
  ];

  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(groundId, date);
  const selectedGround = grounds?.find((g) => g.id === groundId);
  const selectedSlot   = slots?.find((s) => s.id === slotId);
  const totalAmount    = selectedGround?.pricePerHour ?? 0;

  const [phoneSearch,     setPhoneSearch]     = useState("");
  const [searching,       setSearching]       = useState(false);
  const [customerStatus,  setCustomerStatus]  = useState<"idle" | "found" | "notfound">("idle");
  const [foundName,       setFoundName]       = useState("");

  async function handlePhoneSearch() {
    if (phoneSearch.length < 8) return;
    setSearching(true);
    setCustomerStatus("idle");
    try {
      const res  = await fetch(`/api/customers/search?phone=${encodeURIComponent(phoneSearch)}`);
      const json = await res.json();
      if (json.data) {
        setValue("customerName",  json.data.name);
        setValue("customerEmail", json.data.email);
        setValue("customerPhone", json.data.phone);
        setFoundName(json.data.name);
        setCustomerStatus("found");
      } else {
        setCustomerStatus("notfound");
      }
    } finally {
      setSearching(false);
    }
  }

  async function onSubmit(data: AddBookingFormData) {
    if (!selectedGround || !selectedSlot) return;
    const autoStatus = data.bookingType === "online" ? "pending" : data.paymentType === "partial" ? "partial" : "paid";
    try {
      await createBooking.mutateAsync({
        ...data, groundName: selectedGround.name, groundType: selectedGround.type,
        startTime: selectedSlot.startTime, endTime: selectedSlot.endTime,
        duration: 1, amount: totalAmount, paymentStatus: autoStatus,
      });
      toast.success("Booking created successfully");
      router.push("/dashboard/bookings");
    } catch {
      toast.error("Failed to create booking");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-xl" asChild>
          <Link href="/dashboard/bookings"><ChevronLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Booking</h1>
          <p className="text-sm text-muted-foreground">Fill in the details to create a booking</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <SectionCard n="1" title="Ground & Slot Selection" desc="Choose the ground, date and available time slot">
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Ground <span className="text-destructive">*</span></Label>
                    <Controller control={control} name="groundId" render={({ field }) => (
                      <Select value={field.value} onValueChange={(v) => { field.onChange(v); setValue("slotId", ""); }}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={groundsLoading ? "Loading…" : "Select a ground"} />
                        </SelectTrigger>
                        <SelectContent>
                          {grounds?.filter((g) => g.isActive).map((g) => (
                            <SelectItem key={g.id} value={g.id}>
                              <span className="capitalize">{g.type}</span> — {g.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )} />
                    {errors.groundId && <p className="text-xs text-destructive">{errors.groundId.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium" htmlFor="date">Date <span className="text-destructive">*</span></Label>
                    <Input id="date" type="date" min={today} className="h-10" {...register("date", { onChange: () => setValue("slotId", "") })} />
                    {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
                  </div>
                </div>

                {selectedGround && (
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-2.5 text-sm">
                    <span className="font-medium">{selectedGround.name}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{formatCurrency(selectedGround.pricePerHour)}/hr</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">{selectedGround.openingTime} – {selectedGround.closingTime}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Time Slot <span className="text-destructive">*</span></Label>
                    {groundId && date && !slotsLoading && <span className="text-xs text-muted-foreground">Grayed = already booked</span>}
                  </div>
                  {!groundId || !date ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed py-10 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                        <CalendarClock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Select ground & date first</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Available time slots will appear here</p>
                      </div>
                    </div>
                  ) : (
                    <SlotPicker slots={slots ?? []} value={slotId} onChange={(id) => { setValue("slotId", id); clearErrors("slotId"); }} loading={slotsLoading} error={errors.slotId?.message} />
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard n="2" title="Customer Information" desc="Search by phone to auto-fill, or enter details manually">
              <div className="space-y-5">
                <CustomerSearchBar
                  value={phoneSearch}
                  onChange={(v) => { setPhoneSearch(v); setCustomerStatus("idle"); }}
                  onSearch={handlePhoneSearch}
                  searching={searching}
                  customerStatus={customerStatus}
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
                      <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground select-none">+880</span>
                      <Input id="customerPhone" className="h-10 rounded-l-none" placeholder="1711234567" {...register("customerPhone")} />
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

            {selectedGround && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-6 py-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary/70">Booking Summary</p>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-xs text-muted-foreground">Price / Hour</p>
                      <p className="text-lg font-semibold mt-0.5">{formatCurrency(selectedGround.pricePerHour)}</p>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-lg font-semibold mt-0.5">{selectedSlot ? "1 hour" : "—"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="text-3xl font-bold text-primary mt-0.5">{formatCurrency(totalAmount)}</p>
                  </div>
                </div>
              </div>
            )}

            <PaymentSection form={form} totalAmount={totalAmount} />

            <div className="flex items-center justify-end gap-3 pb-4">
              <Button variant="outline" className="h-10 px-6" asChild>
                <Link href="/dashboard/bookings">Cancel</Link>
              </Button>
              <Button type="submit" className="h-10 px-8" disabled={isSubmitting || createBooking.isPending}>
                {isSubmitting || createBooking.isPending ? "Creating…" : "Create Booking"}
              </Button>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6">
              <BookingSummarySidebar ground={selectedGround} slot={selectedSlot} date={date} bookingType={bookingType} paymentType={paymentType} advanceAmount={advanceAmount} />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
