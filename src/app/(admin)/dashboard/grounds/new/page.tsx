"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GroundFormFields, type PhotoSlot } from "@/components/features/add-ground/ground-form-fields";
import { PreviewSidebar } from "@/components/features/add-ground/preview-sidebar";
import { AddGroundSchema, type AddGroundFormData } from "@/schemas/ground";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function AddGroundPage() {
  const router = useRouter();
  const [photoSlots, setPhotoSlots] = useState<PhotoSlot[]>([null, null]);
  const [isPending, setIsPending] = useState(false);

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

  function handlePhotoChange(idx: number, file: File | null) {
    setPhotoSlots((prev) => { const next = [...prev]; next[idx] = file; return next; });
  }

  async function submitGround(data: AddGroundFormData, isDraft: boolean) {
    setIsPending(true);
    try {
      const res  = await fetch("/api/grounds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, status: isDraft ? "draft" : "active" }) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Failed");
      toast.success(isDraft ? "Ground saved as draft" : `${data.name} added successfully`);
      router.push("/dashboard/grounds");
    } catch {
      toast.error("Failed to save ground");
    } finally {
      setIsPending(false);
    }
  }

  const onSave  = form.handleSubmit((d) => submitGround(d, false));
  const onDraft = form.handleSubmit((d) => submitGround(d, true), () => submitGround(form.getValues(), true));

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
        <GroundFormFields form={form} photoSlots={photoSlots} onPhotoChange={handlePhotoChange} />
        <div className="sticky top-6">
          <PreviewSidebar
            control={form.control}
            photoCount={photoSlots.filter(Boolean).length}
            isPending={isPending}
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
