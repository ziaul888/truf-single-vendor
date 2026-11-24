import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ownerApi } from "@/lib/owner-api";
import { useDashboardAudience } from "@/components/dashboard-audience";
import { useDashboardApi } from "./useDashboardApi";
import type { WebsiteSettings, WebsiteImageSlot } from "@/validations/website-settings";
import type {
  Audited, EmailLogPage, NotificationSettings, NotificationsInput, PaymentStatus, Permissions, PublicVenue,
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

const OWNER_VENUE_KEY = ["owner", ...KEY.venue] as const;

export function useVenue() {
  const owner = useDashboardAudience() === "owner";
  return useQuery<VenueProfile>({
    queryKey: owner ? OWNER_VENUE_KEY : KEY.venue,
    queryFn: async () => owner
      ? (await ownerApi.get("/admin/settings/venue")).data.data
      : get("/admin/settings/venue"),
  });
}

/** The public venue profile (name and logo), for pages nobody is signed in to, like the login page. */
export const usePublicVenue = () => useQuery<PublicVenue>({ queryKey: ["venue", "public"], queryFn: () => get("/venue") });

export function useUpdateVenue() {
  const owner = useDashboardAudience() === "owner";
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: VenueInput) =>
      (await (owner ? ownerApi : api).put("/admin/settings/venue", body)).data.data as VenueProfile,
    onSuccess: async (venue) => {
      qc.setQueryData(owner ? OWNER_VENUE_KEY : KEY.venue, venue);
      if (owner) await qc.invalidateQueries({ queryKey: ["owner", "me"] });
    },
  });
}

/** PNG or JPG, 200 KB at most. */
export function useUploadLogo() {
  const { client, scope } = useDashboardApi();
  return useSectionMutation([...scope, ...KEY.venue], async (file: File) => {
    const form = new FormData();
    form.append("logo", file);
    return (await client.post("/admin/settings/venue/logo", form, { headers: { "Content-Type": "multipart/form-data" } })).data.data as VenueProfile;
  });
}

export function useRemoveLogo() {
  const { client, scope } = useDashboardApi();
  return useSectionMutation<void, VenueProfile>([...scope, ...KEY.venue], async () => (await client.delete("/admin/settings/venue/logo")).data.data);
}

// ── Website ──

export type WebsiteSection = WebsiteSettings & Audited;

export function useWebsiteSettings() {
  const { client, scope } = useDashboardApi();
  return useQuery<WebsiteSection>({
    queryKey: [...scope, ...KEY.website],
    queryFn: async () => (await client.get("/admin/settings/website")).data.data,
  });
}

/** hero and social replace those parts whole; sections replaces only the sections sent. */
export function useUpdateWebsite() {
  const { client, scope } = useDashboardApi();
  return useSectionMutation([...scope, ...KEY.website], async (body: Partial<WebsiteSettings>) =>
    (await client.put("/admin/settings/website", body)).data.data as WebsiteSection);
}

/** Uploads and publishes straight away: turf-api sets the image and deletes the old upload. */
export const useUploadWebsiteImage = () =>
  useSectionMutation(KEY.website, async ({ slot, file }: { slot: WebsiteImageSlot; file: File }) => {
    const form = new FormData();
    form.append("image", file);
    return (await api.post(`/admin/settings/website/images/${slot}`, form, { headers: { "Content-Type": "multipart/form-data" } }))
      .data.data as WebsiteSection;
  });

// ── Payments (read-only) ──

export function usePaymentStatus() {
  const { client, scope } = useDashboardApi();
  return useQuery<PaymentStatus>({
    queryKey: [...scope, ...KEY.payments],
    queryFn: async () => (await client.get("/admin/settings/payments/status")).data.data,
  });
}

// ── Notifications ──

export function useNotificationSettings() {
  const { client, scope } = useDashboardApi();
  return useQuery<NotificationSettings>({
    queryKey: [...scope, ...KEY.notifications],
    queryFn: async () => (await client.get("/admin/settings/notifications")).data.data,
  });
}

export function useUpdateNotifications() {
  const qc = useQueryClient();
  const { client, scope } = useDashboardApi();
  return useMutation({
    mutationFn: async (body: NotificationsInput) =>
      (await client.put("/admin/settings/notifications", body)).data.data as NotificationSettings,
    onSuccess: (data) => {
      qc.setQueryData([...scope, ...KEY.notifications], data);
      // slotBlocked and newBooking are the same settings as the two notify switches in slot settings.
      qc.invalidateQueries({ queryKey: [...scope, "settings", "slots"] });
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

export function usePermissions() {
  const { client, scope } = useDashboardApi();
  return useQuery<Permissions>({
    queryKey: [...scope, ...KEY.permissions],
    queryFn: async () => (await client.get("/admin/auth/permissions")).data.data,
  });
}

// ── System (admin only) ──

export const useSystemStatus = ({ enabled = true } = {}) =>
  useQuery<SystemStatus>({ queryKey: KEY.system, queryFn: () => get("/admin/system/status"), enabled });

/** Puts the chosen sections (all three when left out) back to their defaults. */
export function useResetSettings() {
  const qc = useQueryClient();
  const { client, scope } = useDashboardApi();
  return useMutation({
    mutationFn: async (sections?: ResettableSection[]) =>
      (await client.post("/admin/settings/reset", sections ? { sections } : {})).data.data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...scope, "settings"] }); // slots, notifications, website
    },
  });
}
