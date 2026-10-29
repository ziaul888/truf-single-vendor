import api from "@/lib/api";
import { redirectToLogin } from "@/lib/redirect-to-login";
import type { ApiFailure } from "@/lib/api-error";
import type { ApiGround } from "@/types/ground";

/** A photo slot in the ground form: an existing photo URL, a newly picked file, or empty. */
export type PhotoSlot = File | string | null;

/** Moves the slot at `from` to `to`, shifting the others along (drag-and-drop order). */
export function movePhotoSlot(slots: PhotoSlot[], from: number, to: number): PhotoSlot[] {
  const next = [...slots];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/** Thrown when a photo call fails, carrying turf-api's error envelope. */
export class PhotoError extends Error {
  constructor(public failure: ApiFailure) {
    super(failure.error);
    this.name = "PhotoError";
  }
}

/** turf-api identifies a photo by the last part of its URL. */
export const photoFileName = (url: string) => url.split("/").pop() ?? url;

// fetch, not axios: the shared axios client forces a JSON content type, and the browser
// must set the multipart boundary itself.
async function uploadPhoto(groundId: string, file: File): Promise<ApiGround> {
  const form = new FormData();
  form.append("photo", file);
  const res = await fetch(`/api/v1/admin/grounds/${groundId}/photos`, { method: "POST", body: form });
  if (res.status === 401) redirectToLogin();
  if (res.status === 413) throw new PhotoError({ error: "Photo must be 2 MB or smaller", code: "PHOTO_TOO_LARGE" });
  const json = await res.json();
  if (!json.success) throw new PhotoError(json);
  return json.data;
}

async function deletePhoto(groundId: string, url: string): Promise<ApiGround> {
  const { data } = await api.delete(`/admin/grounds/${groundId}/photos/${encodeURIComponent(photoFileName(url))}`);
  return data.data;
}

async function reorderPhotos(groundId: string, urls: string[]): Promise<ApiGround> {
  const { data } = await api.put(`/admin/grounds/${groundId}/photos`, { photos: urls.map(photoFileName) });
  return data.data;
}

/**
 * Makes the ground's photos match the form's slots: deletes removed photos, uploads new
 * files, then puts the slots first in their on-screen order. Photos the form doesn't show
 * (the API allows 5, the form has 2 slots) are kept after them.
 */
export async function syncGroundPhotos(groundId: string, current: string[], slots: PhotoSlot[]) {
  const kept = new Set(slots.filter((s): s is string => typeof s === "string"));
  // Only photos that were in the form's slots can be removed from it.
  const shownBefore = current.slice(0, slots.length);
  let photos = current;

  for (const url of shownBefore.filter((u) => !kept.has(u))) {
    photos = (await deletePhoto(groundId, url)).photos;
  }

  const wanted: string[] = [];
  for (const slot of slots) {
    if (typeof slot === "string") wanted.push(slot);
    else if (slot instanceof File) {
      photos = (await uploadPhoto(groundId, slot)).photos;
      wanted.push(photos[photos.length - 1]);
    }
  }

  const order = [...wanted, ...photos.filter((p) => !wanted.includes(p))];
  if (order.some((p, i) => p !== photos[i])) await reorderPhotos(groundId, order);
}
