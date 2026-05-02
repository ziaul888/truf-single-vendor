"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GroundFormFields, type PhotoSlot } from "@/components/features/add-ground/ground-form-fields";
import { PreviewSidebar } from "@/components/features/add-ground/preview-sidebar";
import { AddGroundSchema, type AddGroundFormData } from "@/schemas/ground";
import type { Ground } from "@/hooks/useGrounds";
import { cn } from "@/lib/utils";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function groundToFormData(g: Ground): AddGroundFormData {
  return {
    name:          g.name,
    type:          g.type,
    capacity:      g.capacity,
    description:   "",
    openingTime:   g.openingTime,
    closingTime:   g.closingTime,
    availableDays: "everyday",
    slotDuration:  "60",
    peakPrice:     g.peakPricing.pricePerHour,
    peakRanges:    [{ from: g.peakPricing.from, to: g.peakPricing.to }],
    offPeakPrice:  g.offPeakPricing.pricePerHour,
    amenities:     g.amenities,
    isActive:      g.isActive,
    showOnPortal:  true,
    internalNotes: "",
  };
}

export default function EditGroundPage() {
  const router      = useRouter();
  const { id }      = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>([null, null]);
  const [isPending,  setIsPending]  = useState(false);

  const { data: ground, isLoading, isError } = useQuery<Ground>({
    queryKey: ["grounds", id],
    queryFn: async () => {
      const res  = await fetch(`/api/grounds/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Not found");
      return json.data;
    },
  });

  const form = useForm<AddGroundFormData>({
    resolver: zodResolver(AddGroundSchema),
    defaultValues: {
      type: "football",
      availableDays: "everyday",
      slotDuration: "60",
      peakRanges: [{ from: "", to: "" }],
      amenities: [],
      isActive: true,
      showOnPortal: true,
    },
  });

  useEffect(() => {
    if (!ground) return;
    form.reset(groundToFormData(ground));
    setPhotoSlots([
      ground.photos[0] ?? null,
      ground.photos[1] ?? null,
    ]);
  }, [ground, form]);

  function handlePhotoChange(idx: number, file: File | null) {
    setPhotoSlots((prev) => { const next = [...prev]; next[idx] = file; return next; });
  }

  async function submitUpdate(data: AddGroundFormData) {
    setIsPending(true);
    try {
      const res  = await fetch(`/api/grounds/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed");
      queryClient.invalidateQueries({ queryKey: ["grounds"] });
      toast.success(`${data.name} updated successfully`);
      router.push("/dashboard/grounds");
    } catch {
      toast.error("Failed to update ground");
    } finally {
      setIsPending(false);
    }
  }

  const onSave  = form.handleSubmit(submitUpdate);
  const onDraft = form.handleSubmit(submitUpdate, () => submitUpdate(form.getValues()));

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-5">
            {[1,2,3,4,5,6].map((i) => <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />)}
          </div>
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (isError || !ground) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="font-semibold text-lg">Ground not found</p>
        <Link href="/dashboard/grounds" className="text-sm text-primary underline">Back to grounds</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/grounds" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to grounds
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit ground</h1>
          <p className="text-muted-foreground text-sm">
            Editing <span className="font-medium text-foreground">{ground.name}</span>
            <span className="ml-2 font-mono text-xs">{ground.id}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={cn("rounded-full px-3 py-1 text-xs font-semibold", form.watch("isActive") ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground")}>
            {form.watch("isActive") ? "Active" : "Inactive"}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Last updated {new Date(ground.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] items-start">
        <GroundFormFields form={form} photoSlots={photoSlots} onPhotoChange={handlePhotoChange} />
        <div className="sticky top-6">
          <PreviewSidebar
            control={form.control}
            photoCount={photoSlots.filter(Boolean).length}
            isPending={isPending}
            saveLabel="Save changes"
            onSave={onSave}
            onDraft={onDraft}
            onDiscard={() => router.push("/dashboard/grounds")}
          />
        </div>
      </div>
    </div>
  );
}
