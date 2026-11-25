"use client";

import { DashboardBackLink, DashboardPageHeader } from "@/components/features/dashboard/page-header";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GroundFormFields, type PhotoSlot } from "@/components/features/add-ground/ground-form-fields";
import { GroundSaveBar, PreviewSidebar } from "@/components/features/add-ground/preview-sidebar";
import { AddGroundSchema, toGroundWriteInput, type AddGroundFormData } from "@/schemas/ground";
import { showGroundApiError } from "@/components/features/add-ground/ground-api-errors";
import { useCreateGround, type Ground } from "@/hooks/useGrounds";
import { movePhotoSlot, syncGroundPhotos } from "@/lib/ground-photos";
import { emptyPhotoSlots } from "@/components/features/add-ground/photos-section";
import { useDashboardAudience } from "@/components/dashboard-audience";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminOnly } from "@/components/features/admin-only";

export default function AddGroundPage() {
  return (
    <AdminOnly reason="Only admins can add grounds." allowTenantOwner>
      <AddGroundForm />
    </AdminOnly>
  );
}

function AddGroundForm() {
  const tenant = useDashboardAudience() === "owner";
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
      rules: "",
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
      await syncGroundPhotos(created.id, created.photos, photoSlots, tenant);
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
      <DashboardPageHeader
        title="Add new ground"
        description="Set up your ground, opening hours and rates."
        back={<DashboardBackLink href="/dashboard/grounds">Back to grounds</DashboardBackLink>}
        details={<p className="text-xs font-medium text-muted-foreground">{form.watch("isActive") ? "Active" : "Inactive"}</p>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] items-start">
        <GroundFormFields form={form} photoSlots={photoSlots} onPhotoChange={handlePhotoChange} onPhotoMove={handlePhotoMove} tenant={tenant} />
        <div className="lg:sticky lg:top-6">
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
      <GroundSaveBar isPending={saving} saveLabel="Save ground" onSave={onSave} onDiscard={() => router.push("/dashboard/grounds")} />
    </div>
  );
}
