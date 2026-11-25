"use client";

import { DashboardPageHeader } from "@/components/features/dashboard/page-header";
import { useState } from "react";
import { SlotListSection }   from "@/components/features/slots/slot-list-section";
import { GenerateSlotsForm } from "@/components/features/slots/generate-slots-form";
import { BlockSlotForm }     from "@/components/features/slots/block-slot-form";
import { Button }            from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody } from "@/components/ui/sheet";
import { Ban, Zap } from "lucide-react";
import { useMe } from "@/hooks/useMe";
import { useDashboardAudience } from "@/components/dashboard-audience";

export default function SlotsPage() {
  const [blockOpen,    setBlockOpen]    = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const audience = useDashboardAudience();
  const { data: me } = useMe(audience);
  // Managers can block and unblock; only admins generate slots.
  const canGenerate = me?.role === "admin" || me?.role === "owner";

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Slot management" description="View, generate and block slots per ground.">
        <Button variant="outline" onClick={() => setBlockOpen(true)}><Ban /> Block slot</Button>
        {canGenerate && (
          <Button onClick={() => setGenerateOpen(true)}><Zap /> Generate slots</Button>
        )}
      </DashboardPageHeader>

      <SlotListSection />

      {/* Block slot drawer */}
      <Sheet open={blockOpen} onOpenChange={setBlockOpen}>
        <SheetContent className="w-full max-w-md">
          <SheetHeader>
            <SheetTitle>Block a slot</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <BlockSlotForm onSuccess={() => setBlockOpen(false)} compact />
          </SheetBody>
        </SheetContent>
      </Sheet>

      {/* Generate slots drawer */}
      <Sheet open={generateOpen} onOpenChange={setGenerateOpen}>
        <SheetContent className="w-full max-w-lg">
          <SheetHeader>
            <SheetTitle>Generate slots</SheetTitle>
          </SheetHeader>
          <SheetBody>
            <GenerateSlotsForm onSuccess={() => setGenerateOpen(false)} compact />
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}
