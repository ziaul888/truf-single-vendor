import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { WebsiteSettings, WebsiteImageSlot } from "@/validations/website-settings";
import type {
  Audited, EmailLogPage, NotificationSettings, NotificationsInput, PaymentStatus, Permissions,
  ResettableSection, SystemStatus, VenueInput, VenueProfile,
} from "@/types/settings";

const KEY = {
  venue: ["settings", "venue"],
  website: ["settings", "website"],
  payments: ["settings", "payments-status"],
  notifications: ["settings", "notifications"],
  emailLog: ["settings", "email-log"],
  permissions: ["auth", "permissions"],
  system: ["system", "status"],
} as const;

const get = async <T,>(path: string, params?: object) => (await api.get(path, { params })).data.data as T;

/** Saves (or uploads) and puts the returned section straight into the cache. */
function useSectionMutation<TVars, TResult>(key: readonly string[], fn: (vars: TVars) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: (data) => qc.setQueryData(key, data) });
}

// ── General: venue profile ──

export const useVenue = () => useQuery<VenueProfile>({ queryKey: KEY.venue, queryFn: () => get("/admin/settings/venue") });

export const useUpdateVenue = () =>
  useSectionMutation(KEY.venue, async (body: VenueInput) => (await api.put("/admin/settings/venue", body)).data.data as VenueProfile);

/** PNG or JPG, 200 KB at most. */
export const useUploadLogo = () =>
  useSectionMutation(KEY.venue, async (file: File) => {
    const form = new FormData();
    form.append("logo", file);
    return (await api.post("/admin/settings/venue/logo", form, { headers: { "Content-Type": "multipart/form-data" } })).data.data as VenueProfile;
  });

export const useRemoveLogo = () =>
  useSectionMutation<void, VenueProfile>(KEY.venue, async () => (await api.delete("/admin/settings/venue/logo")).data.data);

// ── Website ──

export type WebsiteSection = WebsiteSettings & Audited;

export const useWebsiteSettings = () =>
  useQuery<WebsiteSection>({ queryKey: KEY.website, queryFn: () => get("/admin/settings/website") });

/** hero and social replace those parts whole; sections replaces only the sections sent. */
export const useUpdateWebsite = () =>
  useSectionMutation(KEY.website, async (body: Partial<WebsiteSettings>) =>
    (await api.put("/admin/settings/website", body)).data.data as WebsiteSection);

/** Uploads and publishes straight away: turf-api sets the image and deletes the old upload. */
export const useUploadWebsiteImage = () =>
  useSectionMutation(KEY.website, async ({ slot, file }: { slot: WebsiteImageSlot; file: File }) => {
    const form = new FormData();
    form.append("image", file);
    return (await api.post(`/admin/settings/website/images/${slot}`, form, { headers: { "Content-Type": "multipart/form-data" } }))
      .data.data as WebsiteSection;
  });

// ── Payments (read-only) ──

export const usePaymentStatus = () =>
  useQuery<PaymentStatus>({ queryKey: KEY.payments, queryFn: () => get("/admin/settings/payments/status") });

// ── Notifications ──

export const useNotificationSettings = () =>
  useQuery<NotificationSettings>({ queryKey: KEY.notifications, queryFn: () => get("/admin/settings/notifications") });

export function useUpdateNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: NotificationsInput) =>
      (await api.put("/admin/settings/notifications", body)).data.data as NotificationSettings,
    onSuccess: (data) => {
      qc.setQueryData(KEY.notifications, data);
      // slotBlocked and newBooking are the same settings as the two notify switches in slot settings.
      qc.invalidateQueries({ queryKey: ["settings", "slots"] });
    },
  });
}

/** At most 5 an hour per user; `to` defaults to the signed-in user. */
export function useSendTestEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (to?: string) => (await api.post("/admin/settings/notifications/test", to ? { to } : {})).data.data as { sent: true },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY.emailLog }),
  });
}

export const useEmailLog = (page: number, limit = 10) =>
  useQuery<EmailLogPage>({
    queryKey: [...KEY.emailLog, page, limit],
    queryFn: () => get("/admin/settings/notifications/log", { page, limit }),
    placeholderData: keepPreviousData,
  });

// ── Access ──

export const usePermissions = () =>
  useQuery<Permissions>({ queryKey: KEY.permissions, queryFn: () => get("/admin/auth/permissions") });

// ── System (admin only) ──

export const useSystemStatus = ({ enabled = true } = {}) =>
  useQuery<SystemStatus>({ queryKey: KEY.system, queryFn: () => get("/admin/system/status"), enabled });

/** Puts the chosen sections (all three when left out) back to their defaults. */
export function useResetSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sections?: ResettableSection[]) =>
      (await api.post("/admin/settings/reset", sections ? { sections } : {})).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] }); // slots, notifications, website
    },
  });
}
