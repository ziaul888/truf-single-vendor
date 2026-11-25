"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export const Sheet      = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose   = Dialog.Close;

export function SheetContent({ children, className, closeClassName }: { children: React.ReactNode; className?: string; closeClassName?: string }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background shadow-xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          "duration-300 ease-in-out",
          "flex flex-col overflow-hidden max-lg:h-dvh max-lg:pt-[env(safe-area-inset-top)] motion-reduce:animate-none",
          className
        )}
      >
        {children}
        <Dialog.Close className={cn("no-press absolute right-4 top-4 grid place-items-center rounded-lg opacity-70 ring-offset-background hover:opacity-100 active:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 max-lg:right-2 max-lg:top-[calc(0.5rem+env(safe-area-inset-top))] max-lg:size-11", closeClassName)}>
          <X className="pointer-events-none h-4 w-4" aria-hidden />
          <span className="sr-only">Close</span>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function SheetHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border-b px-6 py-4 max-lg:pr-16", className)}>{children}</div>;
}

export function SheetTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Dialog.Title className={cn("text-lg font-semibold", className)}>{children}</Dialog.Title>;
}

export function SheetDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Dialog.Description className={cn("text-sm text-muted-foreground mt-0.5", className)}>{children}</Dialog.Description>;
}

export function SheetBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex-1 overflow-y-auto px-6 py-4 max-lg:[&_[data-slot=button]]:min-h-11", className)}>{children}</div>;
}

export function SheetFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("border-t px-6 py-4 flex flex-col gap-2 max-lg:pb-[max(1rem,env(safe-area-inset-bottom))] max-lg:[&_[data-slot=button]]:min-h-11", className)}>{children}</div>;
}
