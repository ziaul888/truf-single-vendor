"use client";

import { useState } from "react";
import { SlotListSection }   from "@/components/features/slots/slot-list-section";
import { GenerateSlotsForm } from "@/components/features/slots/generate-slots-form";
import { BlockSlotForm }     from "@/components/features/slots/block-slot-form";
import { Button }            from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody } from "@/components/ui/sheet";
import { Ban, Zap } from "lucide-react";

export default function SlotsPage() {
  const [blockOpen,    setBlockOpen]    = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Slot management</h1>
          <p className="text-muted-foreground text-sm">View, generate and block slots per ground</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBlockOpen(true)}>
            <Ban className="mr-1.5 h-4 w-4" /> Block slot
          </Button>
          <Button onClick={() => setGenerateOpen(true)}>
            <Zap className="mr-1.5 h-4 w-4" /> Generate slots
          </Button>
        </div>
      </div>

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
