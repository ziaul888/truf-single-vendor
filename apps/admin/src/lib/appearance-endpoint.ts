import type { AppearanceEndpoint } from "@/hooks/useAppearance";
import { ownerApi } from "./owner-api";

export const appearanceEndpoint: AppearanceEndpoint = {
  scope: "turf",
  client: ownerApi,
  path: "/admin/settings/appearance",
};
