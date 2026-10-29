"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PhotoSlot } from "@/lib/ground-photos";
import { SectionCard } from "./section-card";

export type { PhotoSlot };

/** turf-api allows up to 5 photos per ground; the first is the cover. */
export const PHOTO_SLOT_COUNT = 5;

/** An empty set of photo slots for the form. */
export const emptyPhotoSlots = (): PhotoSlot[] => Array(PHOTO_SLOT_COUNT).fill(null);

/** Fills the form's slots from a ground's saved photo URLs. */
export const photoSlotsFrom = (photos: string[]): PhotoSlot[] =>
  Array.from({ length: PHOTO_SLOT_COUNT }, (_, i) => photos[i] ?? null);

interface PhotosSectionProps {
  photoSlots: PhotoSlot[];
  onPhotoChange: (idx: number, file: File | null) => void;
  /** Moves the photo at `from` to `to` (drag and drop, or the arrow buttons). */
  onPhotoMove: (from: number, to: number) => void;
}

// ground-photos.ts syncs these slots (uploads, deletes and order) with turf-api when the form is saved.
export function PhotosSection({ photoSlots, onPhotoChange, onPhotoMove }: PhotosSectionProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Photo must be a JPG or PNG");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo must be under 2 MB");
      return;
    }
    onPhotoChange(idx, file);
  }

  return (
    <SectionCard
      n="2"
      title="Ground Photos"
      desc={`Upload up to ${PHOTO_SLOT_COUNT} photos. Drag to reorder; the first photo is the cover image.`}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {photoSlots.map((slot, idx) => (
          <div
            key={idx}
            className={cn("relative", dragFrom !== null && dragFrom !== idx && "rounded-xl ring-2 ring-primary/20")}
            draggable={!!slot}
            onDragStart={() => setDragFrom(idx)}
            onDragEnd={() => setDragFrom(null)}
            onDragOver={(e) => { if (dragFrom !== null) e.preventDefault(); }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragFrom !== null && dragFrom !== idx) onPhotoMove(dragFrom, idx);
              setDragFrom(null);
            }}
          >
            <PhotoTile
              slot={slot}
              index={idx}
              onPick={() => inputs.current[idx]?.click()}
            />
            {slot && (
              <>
                <button
                  type="button"
                  onClick={() => onPhotoChange(idx, null)}
                  aria-label={`Remove photo ${idx + 1}`}
                  className="bg-destructive absolute -top-1.5 -right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full text-white shadow"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="absolute inset-x-1 bottom-1 z-10 flex items-center justify-between">
                  <MoveButton label="Move left" disabled={idx === 0} onClick={() => onPhotoMove(idx, idx - 1)}>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </MoveButton>
                  <GripVertical className="h-3.5 w-3.5 text-white drop-shadow" aria-hidden />
                  <MoveButton label="Move right" disabled={idx === photoSlots.length - 1} onClick={() => onPhotoMove(idx, idx + 1)}>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </MoveButton>
                </div>
              </>
            )}
            <input
              ref={(el) => { inputs.current[idx] = el; }}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => handleFileInput(e, idx)}
            />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

/** One slot: a saved photo, a newly picked file (previewed locally), or an upload button. */
function PhotoTile({ slot, index, onPick }: { slot: PhotoSlot; index: number; onPick: () => void }) {
  const preview = useObjectUrl(slot instanceof File ? slot : null);
  const src = typeof slot === "string" ? slot : preview;

  return (
    <div
      onClick={() => !slot && onPick()}
      className={cn(
        "relative flex aspect-4/3 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border-2 transition-colors",
        slot ? "border-primary/40 bg-primary/5" : "hover:border-primary/50 hover:bg-muted/40 cursor-pointer border-dashed"
      )}
    >
      {src ? (
        <>
          {/* Local previews are blob: URLs, which next/image can't optimise. */}
          <Image src={src} alt={`Photo ${index + 1}`} fill sizes="200px" className="object-cover" unoptimized={!!preview} />
          {index === 0 && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">Cover</span>
          )}
          {slot instanceof File && (
            <span className="absolute right-1.5 top-6 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">New</span>
          )}
        </>
      ) : (
        <>
          <Upload className="text-muted-foreground/60 h-6 w-6" />
          <p className="text-xs font-medium">{index === 0 ? "Cover photo" : `Photo ${index + 1}`}</p>
          <p className="text-muted-foreground text-[10px]">JPG, PNG · max 2 MB</p>
        </>
      )}
    </div>
  );
}

function MoveButton({ label, disabled, onClick, children }: {
  label: string; disabled: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white disabled:opacity-0"
    >
      {children}
    </button>
  );
}

/** A blob: URL for previewing a picked file, revoked when the file changes. */
function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file) return setUrl(null);
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}
