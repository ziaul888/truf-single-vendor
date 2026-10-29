"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useUpdateBooking } from "@/hooks/useBookings";
import { applyApiErrors, toApiFailure } from "@/lib/api-error";
import { venueToday } from "@/lib/slot-format";
import type { Booking } from "@/types/booking";
import { toast } from "sonner";

const EditSchema = z.object({
  notes: z.string().trim().max(1000, "Keep notes under 1000 characters"),
  dueDate: z.string().refine((d) => d === "" || d >= venueToday(), "Due date can't be in the past"),
  dueNote: z.string().trim().max(500, "Keep the note under 500 characters"),
});
type EditForm = z.infer<typeof EditSchema>;

interface EditBookingDialogProps {
  booking: Booking;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

/** Staff notes, plus the due date and note while money is still owed. Empty fields are cleared. */
export function EditBookingDialog({ booking, open, onOpenChange }: EditBookingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && <EditForm booking={booking} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function EditForm({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const update = useUpdateBooking();
  const hasDue = booking.due > 0;
  const form = useForm<EditForm>({
    resolver: zodResolver(EditSchema),
    defaultValues: { notes: booking.notes ?? "", dueDate: booking.dueDate ?? "", dueNote: booking.dueNote ?? "" },
  });
  const { register, handleSubmit, formState: { errors, dirtyFields } } = form;

  function onSubmit(values: EditForm) {
    const body: { notes?: string | null; dueDate?: string | null; dueNote?: string | null } = {};
    if (dirtyFields.notes) body.notes = values.notes || null;
    if (dirtyFields.dueDate) body.dueDate = values.dueDate || null;
    if (dirtyFields.dueNote) body.dueNote = values.dueNote || null;
    if (Object.keys(body).length === 0) return onClose();

    update.mutate({ id: booking.id, ...body }, {
      onSuccess: () => {
        toast.success("Booking updated");
        onClose();
      },
      onError: (err) => {
        const failure = toApiFailure(err);
        if (!applyApiErrors(form, failure)) toast.error(failure.error);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogHeader>
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogDescription>Staff notes{hasDue ? " and the due payment details" : ""} for {booking.bookingNumber}.</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="edit-notes">Notes</Label>
          <Textarea id="edit-notes" rows={3} className="resize-none text-sm" placeholder="Internal note for staff" {...register("notes")} />
          {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
        </div>
        {hasDue && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="edit-due-date">Due date</Label>
              <Input id="edit-due-date" type="date" min={venueToday()} {...register("dueDate")} />
              {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-due-note">Due note</Label>
              <Input id="edit-due-note" placeholder="e.g. Rest at the counter" {...register("dueNote")} />
              {errors.dueNote && <p className="text-xs text-destructive">{errors.dueNote.message}</p>}
            </div>
          </>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={update.isPending}>{update.isPending ? "Saving…" : "Save"}</Button>
      </DialogFooter>
    </form>
  );
}
