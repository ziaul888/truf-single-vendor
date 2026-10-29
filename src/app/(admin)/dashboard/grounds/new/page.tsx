"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GroundFormFields, type PhotoSlot } from "@/components/features/add-ground/ground-form-fields";
import { PreviewSidebar } from "@/components/features/add-ground/preview-sidebar";
import { AddGroundSchema, toGroundWriteInput, type AddGroundFormData } from "@/schemas/ground";
import { showGroundApiError } from "@/components/features/add-ground/ground-api-errors";
import { useCreateGround, type Ground } from "@/hooks/useGrounds";
import { movePhotoSlot, syncGroundPhotos } from "@/lib/ground-photos";
import { emptyPhotoSlots, photoSlotsFrom } from "@/components/features/add-ground/photos-section";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { AdminOnly } from "@/components/features/admin-only";

export default function AddGroundPage() {
  return (
    <AdminOnly reason="Only admins can add grounds.">
      <AddGroundForm />
    </AdminOnly>
  );
}

function AddGroundForm() {
  const router = useRouter();
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>(emptyPhotoSlots);
  const create = useCreateGround();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const form = useForm<AddGroundFormData>({
    // Fields use z.coerce, so the schema's input type is looser than the form's.
    resolver: zodResolver(AddGroundSchema) as Resolver<AddGroundFormData>,
    defaultValues: {
      name: "",
      description: "",
      address: "",
      openingTime: "",
      closingTime: "",
      type: "football",
      availableDays: "everyday",
      customDays: [],
      slotDuration: "60",
      peakRanges: [{ from: "", to: "" }],
      format: undefined,
      surface: undefined,
      dimensions: "",
      amenities: [],
      isActive: true,
      showOnPortal: true,
    },
  });

  function handlePhotoChange(idx: number, file: File | null) {
    setPhotoSlots((prev) => { const next = [...prev]; next[idx] = file; return next; });
  }

  function handlePhotoMove(from: number, to: number) {
    setPhotoSlots((prev) => movePhotoSlot(prev, from, to));
  }

  // turf-api has no draft status, so a draft is saved as an inactive ground (hidden from the portal).
  // Photos need the ground's id, so they're uploaded after it's created.
  async function submitGround(data: AddGroundFormData, isDraft: boolean) {
    setSaving(true);
    let created: Ground | undefined;
    try {
      const body = toGroundWriteInput(data);
      created = await create.mutateAsync(isDraft ? { ...body, isActive: false } : body);
      await syncGroundPhotos(created.id, [], photoSlots);
      toast.success(isDraft ? "Ground saved as draft (inactive)" : `${data.name} added successfully`);
      router.push("/dashboard/grounds");
    } catch (err) {
      showGroundApiError(form, err);
      // The ground exists even if a photo failed; continue on its edit page so nothing is created twice.
      if (created) router.push(`/dashboard/grounds/${created.id}/edit`);
    } finally {
      queryClient.invalidateQueries({ queryKey: ["grounds"] });
      setSaving(false);
    }
  }

  const onSave  = form.handleSubmit((d) => submitGround(d, false));
  // Drafts still need the fields turf-api requires (name, hours, price).
  const onDraft = form.handleSubmit((d) => submitGround(d, true));

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/grounds" className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to grounds
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Add new ground</h1>
          <p className="text-muted-foreground text-sm">Fill in the details below to add a ground to the system.</p>
        </div>
        <div className={cn("rounded-full px-3 py-1 text-xs font-semibold", form.watch("isActive") ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground")}>
          {form.watch("isActive") ? "Active" : "Inactive"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] items-start">
        <GroundFormFields form={form} photoSlots={photoSlots} onPhotoChange={handlePhotoChange} onPhotoMove={handlePhotoMove} />
        <div className="sticky top-6">
          <PreviewSidebar
            control={form.control}
            photoCount={photoSlots.filter(Boolean).length}
            isPending={saving}
            saveLabel="Save ground"
            onSave={onSave}
            onDraft={onDraft}
            onDiscard={() => router.push("/dashboard/grounds")}
          />
        </div>
      </div>
    </div>
  );
}
