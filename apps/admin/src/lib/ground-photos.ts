import api from "@/lib/api";
import { ownerApi } from "@/lib/owner-api";
import { redirectToLogin } from "@/lib/redirect-to-login";
import { toApiFailure, type ApiFailure } from "@/lib/api-error";
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
async function uploadPhoto(path: string, file: File, tenant: boolean): Promise<ApiGround> {
  const form = new FormData();
  form.append("photo", file);
  const res = await fetch(`/api/v1${tenant ? "/owner" : ""}${path}`, { method: "POST", body: form }).catch(() => {
    throw new PhotoError({ error: "Cannot reach the server. Please try again." });
  });
  if (res.status === 401) redirectToLogin();
  if (res.status === 413) throw new PhotoError({ error: "Photo must be 2 MB or smaller", code: "PHOTO_TOO_LARGE" });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new PhotoError(typeof json?.error === "string" ? json : { error: "Could not upload the photo. Please try again." });
  }
  return json.data;
}

/**
 * Makes the ground's photos match the form's slots: deletes removed photos, uploads new
 * files, then puts the shown photos first in their on-screen order.
 */
export async function syncGroundPhotos(groundId: string, current: string[], slots: PhotoSlot[], tenant: boolean) {
  const client = tenant ? ownerApi : api;
  const path = `/admin/grounds/${groundId}/photos`;
  const kept = new Set(slots.filter((s): s is string => typeof s === "string"));
  // Only photos that were in the form's slots can be removed from it.
  const shownBefore = current.slice(0, slots.length);
  let photos = current;

  for (const url of shownBefore.filter((u) => !kept.has(u))) {
    const result = await client.delete<{ data: ApiGround }>(`${path}/${encodeURIComponent(photoFileName(url))}`)
      .catch((error) => { throw new PhotoError(toApiFailure(error)); });
    photos = result.data.data.photos;
  }

  const wanted: string[] = [];
  for (const slot of slots) {
    if (typeof slot === "string") wanted.push(slot);
    else if (slot instanceof File) {
      photos = (await uploadPhoto(path, slot, tenant)).photos;
      wanted.push(photos[photos.length - 1]);
    }
  }

  const order = [...wanted, ...photos.filter((p) => !wanted.includes(p))];
  if (order.some((p, i) => p !== photos[i])) {
    await client.put(path, { photos: order.map(photoFileName) })
      .catch((error) => { throw new PhotoError(toApiFailure(error)); });
  }
}
