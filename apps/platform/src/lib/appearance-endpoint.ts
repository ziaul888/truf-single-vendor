import type { AppearanceEndpoint } from "@/hooks/useAppearance";
import { platformApi } from "./platform-api";

export const appearanceEndpoint: AppearanceEndpoint = {
  scope: "platform",
  client: platformApi,
  path: "/appearance",
};
