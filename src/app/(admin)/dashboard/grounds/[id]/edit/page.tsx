"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GroundFormFields, type PhotoSlot } from "@/components/features/add-ground/ground-form-fields";
import { PreviewSidebar } from "@/components/features/add-ground/preview-sidebar";
import { AddGroundSchema, toGroundWriteInput, type AddGroundFormData } from "@/schemas/ground";
import { showGroundApiError } from "@/components/features/add-ground/ground-api-errors";
import { slotSyncMessage, useGround, useUpdateGround, type Ground } from "@/hooks/useGrounds";
import { hourToTime } from "@/lib/ground-format";
import { movePhotoSlot, syncGroundPhotos } from "@/lib/ground-photos";
import { emptyPhotoSlots, photoSlotsFrom } from "@/components/features/add-ground/photos-section";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AdminOnly } from "@/components/features/admin-only";

const toTimeInput = (hour: number) => (hour === 24 ? "00:00" : hourToTime(hour));

function groundToFormData(g: Ground): AddGroundFormData {
  return {
    name:          g.name,
    type:          g.sport,
    capacity:      g.capacity ?? undefined,
    format:        g.format ?? undefined,
    surface:       g.surface ?? undefined,
    dimensions:    g.dimensions ?? "",
    description:   g.description ?? "",
    address:       g.address ?? "",
    openingTime:   g.openingTime,
    // A time picker can't show 24:00; 00:00 means midnight.
    closingTime:   g.closingHour === 24 ? "00:00" : g.closingTime,
    offPeakPrice:  g.pricePerHour,
    isActive:      g.isActive,
    availableDays: g.availableDays,
    customDays:    g.customDays,
    amenities:     g.amenities,
    showOnPortal:  g.showOnPortal,
    internalNotes: g.internalNotes ?? "",
    slotDuration:  g.slotDurationMinutes === 120 ? "120" : "60",
    peakPrice:     g.peakPricePerHour ?? undefined,
    peakRanges:    g.peakRanges.length
      ? g.peakRanges.map((r) => ({ from: hourToTime(r.fromHour), to: toTimeInput(r.toHour) }))
      : [{ from: "", to: "" }],
  };
}

export default function EditGroundPage() {
  return (
    <AdminOnly reason="Only admins can edit grounds.">
      <EditGroundForm />
    </AdminOnly>
  );
}

function EditGroundForm() {
  const router      = useRouter();
  const { id }      = useParams<{ id: string }>();
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>(emptyPhotoSlots);
  const update = useUpdateGround();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: ground, isLoading, isError } = useGround(id);

  const form = useForm<AddGroundFormData>({
    // Fields use z.coerce, so the schema's input type is looser than the form's.
    resolver: zodResolver(AddGroundSchema) as Resolver<AddGroundFormData>,
    defaultValues: {
      type: "football",
      availableDays: "everyday",
      customDays: [],
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
    setPhotoSlots(photoSlotsFrom(ground.photos));
  }, [ground, form]);

  function handlePhotoChange(idx: number, file: File | null) {
    setPhotoSlots((prev) => { const next = [...prev]; next[idx] = file; return next; });
  }

  function handlePhotoMove(from: number, to: number) {
    setPhotoSlots((prev) => movePhotoSlot(prev, from, to));
  }

  // PATCH leaves fields the form doesn't have (e.g. address) untouched.
  async function submitUpdate(data: AddGroundFormData, isDraft = false) {
    if (!ground) return;
    setSaving(true);
    try {
      const changes = toGroundWriteInput(data);
      const updated = await update.mutateAsync({ id, changes: isDraft ? { ...changes, isActive: false } : changes });
      await syncGroundPhotos(id, ground.photos, photoSlots);
      toast.success(isDraft ? `${data.name} saved as draft (inactive)` : `${data.name} updated successfully`, {
        description: updated.slotSync ? slotSyncMessage(updated.slotSync) : undefined,
      });
      router.push("/dashboard/grounds");
    } catch (err) {
      showGroundApiError(form, err);
    } finally {
      queryClient.invalidateQueries({ queryKey: ["grounds"] });
      setSaving(false);
    }
  }

  const onSave  = form.handleSubmit((d) => submitUpdate(d));
  const onDraft = form.handleSubmit((d) => submitUpdate(d, true));

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
        <GroundFormFields form={form} photoSlots={photoSlots} onPhotoChange={handlePhotoChange} onPhotoMove={handlePhotoMove} />
        <div className="sticky top-6">
          <PreviewSidebar
            control={form.control}
            photoCount={photoSlots.filter(Boolean).length}
            isPending={saving}
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
