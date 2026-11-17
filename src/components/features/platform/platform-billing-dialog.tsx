"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function BillingDialog({
  label,
  title,
  description,
  children,
  variant = "outline",
}: {
  label: string;
  title: string;
  description: string;
  variant?: "outline" | "default";
  children: (close: () => void, setBusy: (busy: boolean) => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!busy) setOpen(value);
      }}
    >
      <Button className="h-11" variant={variant} onClick={() => setOpen(true)}>
        {label}
      </Button>
      {open && (
        <DialogContent
          className={busy ? "[&>button]:hidden" : ""}
          onEscapeKeyDown={(e) => {
            if (busy) e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            if (busy) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="pr-5 leading-snug">{title}</DialogTitle>
            <DialogDescription className="leading-relaxed">{description}</DialogDescription>
          </DialogHeader>
          {children(() => setOpen(false), setBusy)}
        </DialogContent>
      )}
    </Dialog>
  );
}
